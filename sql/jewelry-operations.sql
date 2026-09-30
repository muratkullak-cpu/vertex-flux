-- Additions to the installed jewelry studio; run once after jewelry-studio.sql.
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check(role in ('super_admin','admin','staff','customer'));
create or replace function public.vertex_create_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.email),'customer') on conflict(id) do nothing;
 return new;
end $$;
revoke all on function public.vertex_create_profile() from public,anon,authenticated;
alter table public.jewelry_shops
 add column logo_url text not null default '' check (logo_url='' or logo_url ~ '^https://'),
 add column accent text not null default '#bca171' check (accent ~ '^#[0-9a-fA-F]{6}$'),
 add column phrases jsonb not null default '["Hazırını satmıyor, size özel üretiyoruz.","Mücevheri yalnızca sunmuyor, ustalıkla sizin için üretiyoruz.","Size özel tasarım, ustalıkla üretim.","Her ayrıntıda el işçiliği."]' check (jsonb_typeof(phrases)='array' and jsonb_array_length(phrases)=4);
alter table public.jewelry_products
 add column phrase_index int not null default 0 check (phrase_index between 0 and 3),
 add column campaign text not null default '' check (length(campaign)<=100),
 add column approved_by uuid references auth.users(id),
 add column approved_at timestamptz;
grant update(phrase_index,campaign) on public.jewelry_products to authenticated;
grant insert(phrase_index,campaign) on public.jewelry_products to authenticated;

create table public.jewelry_branches (
 id uuid primary key default gen_random_uuid(),
 shop_id uuid not null references public.jewelry_shops(id),
 name text not null check (length(name) between 2 and 120),
 address text not null default '' check (length(address)<=500),
 directions_url text not null default '' check (directions_url='' or directions_url ~ '^https://(www[.])?(google[.]com/maps|maps[.]google[.]com|maps[.]app[.]goo[.]gl|goo[.]gl/maps)'),
 phone text not null default '', hours text not null default '',
 active boolean not null default true,created_at timestamptz not null default now()
);
alter table public.jewelry_branches enable row level security;
grant select,insert,update on public.jewelry_branches to authenticated;
revoke all on public.jewelry_branches from anon;
create policy jewelry_branches_read on public.jewelry_branches for select to authenticated
 using ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=jewelry_branches.shop_id and m.user_id=(select auth.uid())));
create policy jewelry_branches_write on public.jewelry_branches for all to authenticated
 using ((select public.vertex_is_admin())) with check ((select public.vertex_is_admin()));

create table public.jewelry_favorites (
 user_id uuid not null references auth.users(id),product_id uuid not null references public.jewelry_products(id),
 created_at timestamptz not null default now(),primary key(user_id,product_id)
);
create table public.jewelry_comments (
 id uuid primary key default gen_random_uuid(),product_id uuid not null references public.jewelry_products(id),
 user_id uuid not null references auth.users(id),display_name text not null check(length(display_name) between 2 and 60),
 body text not null check(length(body) between 2 and 1000),status text not null default 'pending' check(status in ('pending','approved','hidden')),
 created_at timestamptz not null default now()
);
create index jewelry_comments_product_idx on public.jewelry_comments(product_id,created_at desc);
create table public.jewelry_followers (
 shop_id uuid not null references public.jewelry_shops(id),user_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(),primary key(shop_id,user_id)
);
create table public.jewelry_notifications (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 shop_id uuid not null references public.jewelry_shops(id),product_id uuid references public.jewelry_products(id),
 message text not null,seen boolean not null default false,created_at timestamptz not null default now()
);
alter table public.jewelry_favorites enable row level security;
alter table public.jewelry_comments enable row level security;
alter table public.jewelry_followers enable row level security;
alter table public.jewelry_notifications enable row level security;
revoke all on public.jewelry_favorites,public.jewelry_comments,public.jewelry_followers,public.jewelry_notifications from anon,authenticated;
grant select on public.jewelry_favorites,public.jewelry_comments,public.jewelry_followers,public.jewelry_notifications to authenticated;
grant update(status) on public.jewelry_comments to authenticated;
grant update(seen) on public.jewelry_notifications to authenticated;
create policy jewelry_favorites_self on public.jewelry_favorites for select to authenticated using (user_id=(select auth.uid()));
create policy jewelry_comments_read on public.jewelry_comments for select to authenticated
 using (user_id=(select auth.uid()) or (select public.vertex_is_admin()) or exists(select 1 from public.jewelry_products p join public.jewelry_members m on m.shop_id=p.shop_id where p.id=jewelry_comments.product_id and m.user_id=(select auth.uid())));
create policy jewelry_comments_moderate on public.jewelry_comments for update to authenticated
 using ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_products p join public.jewelry_members m on m.shop_id=p.shop_id where p.id=jewelry_comments.product_id and m.user_id=(select auth.uid())))
 with check ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_products p join public.jewelry_members m on m.shop_id=p.shop_id where p.id=jewelry_comments.product_id and m.user_id=(select auth.uid())));
create policy jewelry_followers_self on public.jewelry_followers for select to authenticated using(user_id=(select auth.uid()));
create policy jewelry_notifications_self on public.jewelry_notifications for select to authenticated using(user_id=(select auth.uid()));
create policy jewelry_notifications_seen on public.jewelry_notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create or replace function public.jewelry_customer_action(p_action text,p_product uuid default null,p_shop uuid default null,p_name text default '',p_body text default '')
returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();s uuid;result boolean;
begin
 if u is null then raise exception 'Oturum gerekli';end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 if p_action in ('save','unsave','comment') then
  select p.shop_id into s from public.jewelry_products p join public.jewelry_shops j on j.id=p.shop_id where p.id=p_product and p.status='published' and j.published;
  if s is null then raise exception 'Ürün yayında değil';end if;
  if p_action='save' then insert into public.jewelry_favorites(user_id,product_id) values(u,p_product) on conflict do nothing;
  elsif p_action='unsave' then delete from public.jewelry_favorites where user_id=u and product_id=p_product;
  else
   if (select count(*) from public.jewelry_comments where user_id=u and created_at>now()-interval '1 day')>=10 then raise exception 'Günlük yorum sınırına ulaşıldı';end if;
   insert into public.jewelry_comments(product_id,user_id,display_name,body) values(p_product,u,trim(p_name),trim(p_body));
  end if;
 elsif p_action in ('follow','unfollow') then
  if not exists(select 1 from public.jewelry_shops where id=p_shop and published) then raise exception 'Vitrin yayında değil';end if;
  if p_action='follow' then insert into public.jewelry_followers(shop_id,user_id) values(p_shop,u) on conflict do nothing;
  else delete from public.jewelry_followers where shop_id=p_shop and user_id=u;end if;
 else raise exception 'Geçersiz işlem';end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.jewelry_customer_action(text,uuid,uuid,text,text) from public,anon;
grant execute on function public.jewelry_customer_action(text,uuid,uuid,text,text) to authenticated;

create or replace function public.jewelry_engagement(p_shop uuid)
returns table(product_id uuid,saves bigint,comments bigint) language plpgsql security definer set search_path=public as $$
begin
 if not public.vertex_is_admin() and not exists(select 1 from public.jewelry_members where shop_id=p_shop and user_id=auth.uid()) then raise exception 'Yetki yok';end if;
 return query select p.id,(select count(*) from public.jewelry_favorites f where f.product_id=p.id),(select count(*) from public.jewelry_comments c where c.product_id=p.id) from public.jewelry_products p where p.shop_id=p_shop;
end $$;
revoke all on function public.jewelry_engagement(uuid) from public,anon;
grant execute on function public.jewelry_engagement(uuid) to authenticated;

create table public.jewelry_updates (
 id uuid primary key default gen_random_uuid(),shop_id uuid not null references public.jewelry_shops(id),
 message text not null,actor uuid references auth.users(id),created_at timestamptz not null default now()
);
alter table public.jewelry_updates enable row level security;
revoke all on public.jewelry_updates from anon,authenticated;
grant select on public.jewelry_updates to authenticated;
create policy jewelry_updates_read on public.jewelry_updates for select to authenticated using((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=jewelry_updates.shop_id and m.user_id=(select auth.uid())));

create or replace function public.jewelry_change_log() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_table_name='jewelry_shops' then
  if (to_jsonb(new)-'image_credits'-'updated_at') is distinct from (to_jsonb(old)-'image_credits'-'updated_at') then
  insert into public.jewelry_updates(shop_id,message,actor) values(new.id,'Vitrin ayarları güncellendi',auth.uid());
  end if;
 elsif tg_table_name='jewelry_branches' then
  insert into public.jewelry_updates(shop_id,message,actor) values(new.shop_id,'Şube bilgileri güncellendi',auth.uid());
 elsif tg_table_name='jewelry_products' and new.status='published' and old.status is distinct from 'published' then
  insert into public.jewelry_updates(shop_id,message,actor) values(new.shop_id,'Ürün onaylanıp yayımlandı: '||new.title,new.approved_by);
  if old.approved_at is null then
  insert into public.jewelry_notifications(user_id,shop_id,product_id,message)
   select f.user_id,new.shop_id,new.id,'Yeni ürün: '||new.title from public.jewelry_followers f where f.shop_id=new.shop_id;
  end if;
 end if;
 return new;
end $$;
revoke all on function public.jewelry_change_log() from public,anon,authenticated;
create trigger jewelry_shop_updates after update on public.jewelry_shops for each row execute function public.jewelry_change_log();
create trigger jewelry_branch_updates after insert or update on public.jewelry_branches for each row execute function public.jewelry_change_log();
create trigger jewelry_product_updates after update on public.jewelry_products for each row execute function public.jewelry_change_log();

create or replace function public.jewelry_source_immutable() returns trigger language plpgsql set search_path=public as $$
begin
 if old.source_path is not null and new.source_path is distinct from old.source_path then raise exception 'Orijinal fotoğraf değiştirilemez; yeni ürün oluşturun';end if;
 if old.status in ('generating','review','published') and new.style is distinct from old.style then raise exception 'Üretilmiş ürünün stili değiştirilemez';end if;
 return new;
end $$;
revoke all on function public.jewelry_source_immutable() from public,anon,authenticated;
create trigger jewelry_source_immutable before update on public.jewelry_products for each row execute function public.jewelry_source_immutable();
