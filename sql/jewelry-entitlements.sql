alter table public.jewelry_shops add column image_credits int not null default 0 check(image_credits>=0);
alter table public.jewelry_products drop constraint jewelry_products_generation_count_check;
alter table public.jewelry_products add constraint jewelry_products_generation_count_check check(generation_count>=0);
alter table public.jewelry_products add column claim_cost int not null default 0,add column claim_free_date date,add column claim_previous_status text;
create table public.jewelry_daily_rights(shop_id uuid not null references public.jewelry_shops(id),day date not null,used int not null default 0 check(used between 0 and 1),primary key(shop_id,day));
create table public.jewelry_image_credit_ledger(id uuid primary key default gen_random_uuid(),shop_id uuid not null references public.jewelry_shops(id),amount int not null,note text not null,actor uuid references auth.users(id),created_at timestamptz not null default now());
alter table public.jewelry_daily_rights enable row level security;
alter table public.jewelry_image_credit_ledger enable row level security;
revoke all on public.jewelry_daily_rights,public.jewelry_image_credit_ledger from anon,authenticated;
grant select on public.jewelry_daily_rights,public.jewelry_image_credit_ledger to authenticated;
create policy jewelry_daily_rights_read on public.jewelry_daily_rights for select to authenticated using((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=jewelry_daily_rights.shop_id and m.user_id=(select auth.uid())));
create policy jewelry_credit_ledger_read on public.jewelry_image_credit_ledger for select to authenticated using((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=jewelry_image_credit_ledger.shop_id and m.user_id=(select auth.uid())));
create or replace function public.jewelry_topup_credits(p_shop uuid,p_amount int,p_note text)
returns int language plpgsql security definer set search_path=public as $$
declare balance int;
begin
 if not public.vertex_is_admin() or auth.uid() is null then raise exception 'Yetki yok';end if;
 if p_amount<1 or p_amount>10000 or length(trim(p_note))<2 then raise exception 'Geçersiz kredi yükleme';end if;
 update public.jewelry_shops set image_credits=image_credits+p_amount where id=p_shop returning image_credits into balance;
 if balance is null then raise exception 'Mağaza yok';end if;
 insert into public.jewelry_image_credit_ledger(shop_id,amount,note,actor) values(p_shop,p_amount,p_note,auth.uid());
 return balance;
end $$;
revoke all on function public.jewelry_topup_credits(uuid,int,text) from public,anon;
grant execute on function public.jewelry_topup_credits(uuid,int,text) to authenticated;
create or replace function public.jewelry_claim_generation(p_id uuid)
returns public.jewelry_products language plpgsql security definer set search_path=public as $$
declare p public.jewelry_products;s uuid;used_today int;cost int:=0;free_day date;today date:=(now() at time zone 'Europe/Istanbul')::date;balance int;
begin
 select shop_id into s from public.jewelry_products where id=p_id;if s is null then return null;end if;
 select image_credits into balance from public.jewelry_shops where id=s for update;
 select * into p from public.jewelry_products where id=p_id for update;
 if p.source_path is null or p.status not in ('draft','review') or p.video_status in ('processing','review','published') then return null;end if;
 if p.generation_count=1 then cost:=0; -- one free image regeneration for this product
 elsif p.generation_count=0 then
  insert into public.jewelry_daily_rights(shop_id,day) values(s,today) on conflict do nothing;
  select used into used_today from public.jewelry_daily_rights where shop_id=s and day=today;
  if used_today=0 then free_day:=today;update public.jewelry_daily_rights set used=1 where shop_id=s and day=today;else cost:=1;end if;
 else cost:=1;end if;
 if cost>0 then
  if balance<cost then raise exception 'image_credits_missing';end if;
  update public.jewelry_shops set image_credits=image_credits-cost where id=s;
  insert into public.jewelry_image_credit_ledger(shop_id,amount,note) values(s,-cost,'Görsel üretim rezervasyonu: '||p_id);
 end if;
 update public.jewelry_products set status='generating',generation_count=generation_count+1,generation_claimed_at=now(),claim_cost=cost,claim_free_date=free_day,claim_previous_status=p.status,updated_at=now() where id=p_id returning * into p;
 return p;
end $$;
create or replace function public.jewelry_release_generation(p_id uuid,p_claimed_at timestamptz)
returns boolean language plpgsql security definer set search_path=public as $$
declare p public.jewelry_products;s uuid;
begin
 select shop_id into s from public.jewelry_products where id=p_id;if s is null then return false;end if;
 perform 1 from public.jewelry_shops where id=s for update;
 select * into p from public.jewelry_products where id=p_id for update;
 if p.status<>'generating' or p.generation_claimed_at is distinct from p_claimed_at then return false;end if;
 if p.claim_cost>0 then
  update public.jewelry_shops set image_credits=image_credits+p.claim_cost where id=s;
  insert into public.jewelry_image_credit_ledger(shop_id,amount,note) values(s,p.claim_cost,'Başarısız üretim hakkı iadesi: '||p_id);
 end if;
 if p.claim_free_date is not null then update public.jewelry_daily_rights set used=0 where shop_id=s and day=p.claim_free_date;end if;
 update public.jewelry_products set status=coalesce(p.claim_previous_status,'draft'),generation_count=greatest(0,generation_count-1),generation_claimed_at=null,claim_cost=0,claim_free_date=null,claim_previous_status=null where id=p_id;
 return true;
end $$;
revoke all on function public.jewelry_claim_generation(uuid),public.jewelry_release_generation(uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.jewelry_claim_generation(uuid),public.jewelry_release_generation(uuid,timestamptz) to service_role;
