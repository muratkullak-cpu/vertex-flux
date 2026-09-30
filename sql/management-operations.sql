-- Management additions; existing clients remain unaffected until configured.
alter table public.subscriptions
 add column billing_period text not null default 'monthly' check(billing_period in ('monthly','yearly')),
 add column paid_until date,
 add column auto_suspend boolean not null default false,
 add column grace_days int not null default 0 check(grace_days between 0 and 30);
alter table public.properties add column subscription_id uuid references public.subscriptions(id);
create table public.subscription_periods (
 id uuid primary key default gen_random_uuid(),subscription_id uuid not null references public.subscriptions(id),
 period_start date not null,period_end date not null,amount numeric not null check(amount>=0),
 payment_id uuid not null references public.payments(id),reference text not null,
 created_at timestamptz not null default now(),unique(subscription_id,period_start)
);
alter table public.subscription_periods enable row level security;
grant select,insert on public.subscription_periods to authenticated;
revoke all on public.subscription_periods from anon;
create policy subscription_periods_admin on public.subscription_periods for all to authenticated
 using((select public.vertex_is_admin())) with check((select public.vertex_is_admin()));
create or replace function public.vertex_receive_subscription(p_id uuid,p_reference text)
returns date language plpgsql set search_path=public as $$
declare s public.subscriptions;next_date date;payment uuid;
begin
 if not public.vertex_is_admin() then raise exception 'Yetki yok';end if;
 if length(trim(p_reference))<2 then raise exception 'Tahsilat açıklaması gerekli';end if;
 select * into s from public.subscriptions where id=p_id for update;
 if not found or s.status='cancelled' then raise exception 'Abonelik bulunamadı';end if;
 if s.next_renewal>(now() at time zone 'Europe/Istanbul')::date then raise exception 'Bu dönem zaten yenilenmiş veya vadesi gelmemiş';end if;
 next_date:=(s.next_renewal+case when s.billing_period='yearly' then interval '1 year' else interval '1 month' end)::date;
 insert into public.payments(client_id,amount,currency,status,payment_method,paid_at,notes,created_by)
 values(s.client_id,s.monthly_price,'TRY','odendi','Abonelik tahsilatı',now(),p_reference,auth.uid()) returning id into payment;
 insert into public.subscription_periods(subscription_id,period_start,period_end,amount,payment_id,reference)
 values(s.id,s.next_renewal,next_date,s.monthly_price,payment,p_reference);
 update public.subscriptions set next_renewal=next_date,paid_until=next_date,status='active' where id=s.id;
 if s.monthly_credits>0 then insert into public.credit_ledger(client_id,subscription_id,amount,note,created_by)
 values(s.client_id,s.id,s.monthly_credits,'Tahsil edilmiş abonelik dönemi kredisi',auth.uid());end if;
 insert into public.audit_logs(user_id,action,entity_type,entity_id) values(auth.uid(),'Abonelik tahsil edildi ve dönem açıldı','subscriptions',s.id);
 return next_date;
end $$;
revoke all on function public.vertex_receive_subscription(uuid,text) from public,anon;
grant execute on function public.vertex_receive_subscription(uuid,text) to authenticated;
create or replace function public.vertex_renew_subscription(p_id uuid)
returns date language plpgsql set search_path=public as $$
declare s public.subscriptions;next_date date;
begin
 if not public.vertex_is_admin() then raise exception 'Yetki yok';end if;
 select * into s from public.subscriptions where id=p_id for update;
 if not found or s.status<>'active' then raise exception 'Aktif abonelik bulunamadı';end if;
 if s.auto_suspend then raise exception 'Bu abonelik tahsilat kaydı ile yenilenmeli';end if;
 if s.next_renewal>(now() at time zone 'Europe/Istanbul')::date then raise exception 'Yenileme tarihi henüz gelmedi';end if;
 next_date:=(s.next_renewal+case when s.billing_period='yearly' then interval '1 year' else interval '1 month' end)::date;
 update public.subscriptions set next_renewal=next_date where id=p_id;
 if s.monthly_credits>0 then insert into public.credit_ledger(client_id,subscription_id,amount,note,created_by) values(s.client_id,s.id,s.monthly_credits,'Elle yenilenen abonelik kredisi',auth.uid());end if;
 return next_date;
end $$;
create or replace function public.vertex_resolve_qr(p_slug text)
returns text language plpgsql security definer set search_path=public as $$
declare dest text;link_id uuid;
begin
 if p_slug is null or p_slug !~ '^[a-z0-9-]{5,48}$' then return null;end if;
 update public.qr_links q set scans=q.scans+1
 where q.slug=p_slug and q.active=true and not exists(
  select 1 from public.properties p join public.subscriptions s on s.id=p.subscription_id
  where p.id=q.property_id and s.auto_suspend and (s.status<>'active' or s.paid_until is null or s.paid_until+s.grace_days <= (now() at time zone 'Europe/Istanbul')::date)
 ) returning q.id,q.target_url into link_id,dest;
 if link_id is not null then insert into public.qr_scans(qr_id) values(link_id);end if;
 return dest;
end $$;

create table public.client_updates(
 id uuid primary key default gen_random_uuid(),client_id uuid not null references public.clients(id),
 kind text not null check(kind in ('note','service','update')),message text not null check(length(message) between 2 and 3000),
 created_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create table public.client_files(
 id uuid primary key default gen_random_uuid(),client_id uuid not null references public.clients(id),
 title text not null,storage_path text not null,mime_type text not null,file_size int not null check(file_size between 1 and 26214400),
 created_by uuid references auth.users(id),created_at timestamptz not null default now()
);
alter table public.client_updates enable row level security;
alter table public.client_files enable row level security;
grant select,insert on public.client_updates,public.client_files to authenticated;
revoke all on public.client_updates,public.client_files from anon;
create policy client_updates_admin on public.client_updates for all to authenticated using((select public.vertex_is_admin())) with check((select public.vertex_is_admin()));
create policy client_files_admin on public.client_files for all to authenticated using((select public.vertex_is_admin())) with check((select public.vertex_is_admin()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('client-files','client-files',false,26214400,array['application/pdf','image/jpeg','image/png','image/webp','video/mp4']) on conflict(id) do nothing;
create policy client_files_storage_read on storage.objects for select to authenticated using(bucket_id='client-files' and (select public.vertex_is_admin()));
create policy client_files_storage_insert on storage.objects for insert to authenticated with check(bucket_id='client-files' and (select public.vertex_is_admin()));

create table public.admin_pins(
 user_id uuid primary key references auth.users(id),pin_hash text not null,
 failures int not null default 0,locked_until timestamptz
);
alter table public.admin_pins enable row level security;
revoke all on public.admin_pins from public,anon,authenticated;
create or replace function public.vertex_set_pin(p_pin text)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
begin
 if not public.vertex_is_admin() or auth.uid() is null then raise exception 'Yetki yok';end if;
 if p_pin !~ '^[0-9]{6,12}$' then raise exception 'PIN 6–12 rakam olmalı';end if;
 insert into public.admin_pins(user_id,pin_hash) values(auth.uid(),crypt(p_pin,gen_salt('bf',10)))
 on conflict(user_id) do update set pin_hash=excluded.pin_hash,failures=0,locked_until=null;
 return true;
end $$;
create or replace function public.vertex_pin_status()
returns boolean language sql security definer set search_path=public as $$
 select public.vertex_is_admin() and exists(select 1 from public.admin_pins where user_id=auth.uid());
$$;
create or replace function public.vertex_verify_pin(p_pin text)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare r public.admin_pins;good boolean;
begin
 if not public.vertex_is_admin() or auth.uid() is null then return false;end if;
 select * into r from public.admin_pins where user_id=auth.uid() for update;
 if not found or r.locked_until>now() then return false;end if;
 good:=r.pin_hash=crypt(p_pin,r.pin_hash);
 update public.admin_pins set failures=case when good then 0 else failures+1 end,
 locked_until=case when good then null when failures+1>=5 then now()+interval '15 minutes' else null end where user_id=auth.uid();
 return good;
end $$;
revoke all on function public.vertex_set_pin(text),public.vertex_pin_status(),public.vertex_verify_pin(text) from public,anon;
grant execute on function public.vertex_set_pin(text),public.vertex_pin_status(),public.vertex_verify_pin(text) to authenticated;
