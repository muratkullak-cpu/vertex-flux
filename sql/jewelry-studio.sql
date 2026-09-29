-- Jewelry studio and public collection. Run once on the vertex-flux Supabase project.
create table if not exists public.jewelry_shops (
 id uuid primary key default gen_random_uuid(),
 client_id uuid not null unique references public.clients(id),
 slug text not null unique check (slug ~ '^[a-z0-9-]{5,48}$'),
 name text not null check (length(trim(name)) between 2 and 120),
 tagline text not null default '',
 whatsapp text not null default '',
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.jewelry_members (
 shop_id uuid not null references public.jewelry_shops(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'editor' check (role in ('owner','editor')),
 primary key (shop_id,user_id)
);
create table if not exists public.jewelry_products (
 id uuid primary key default gen_random_uuid(),
 shop_id uuid not null references public.jewelry_shops(id),
 title text not null check (length(trim(title)) between 2 and 160),
 category text not null check (category in ('yuzuk','kupe','kolye','bilezik','diger')),
 description text not null default '',
 style text not null check (style in ('model','studio')),
 source_path text,
 candidate_path text,
 public_path text,
 status text not null default 'draft' check (status in ('draft','generating','review','published')),
 generation_count int not null default 0 check (generation_count between 0 and 2),
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (status <> 'published' or public_path is not null)
);
create index if not exists jewelry_products_shop_idx on public.jewelry_products(shop_id,created_at desc);

alter table public.jewelry_shops enable row level security;
alter table public.jewelry_members enable row level security;
alter table public.jewelry_products enable row level security;
revoke all on public.jewelry_shops,public.jewelry_members,public.jewelry_products from anon;
grant select,insert,update on public.jewelry_shops,public.jewelry_members,public.jewelry_products to authenticated;

create policy jewelry_members_read on public.jewelry_members for select to authenticated
 using (user_id=(select auth.uid()) or (select public.vertex_is_admin()));
create policy jewelry_members_admin_write on public.jewelry_members for all to authenticated
 using ((select public.vertex_is_admin())) with check ((select public.vertex_is_admin()));
create policy jewelry_shops_read on public.jewelry_shops for select to authenticated
 using ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=id and m.user_id=(select auth.uid())));
create policy jewelry_shops_admin_insert on public.jewelry_shops for insert to authenticated
 with check ((select public.vertex_is_admin()) and exists(select 1 from public.clients c where c.id=client_id and c.sector='kuyum'));
create policy jewelry_shops_manage on public.jewelry_shops for update to authenticated
 using ((select public.vertex_is_admin())) with check ((select public.vertex_is_admin()));
create policy jewelry_products_read on public.jewelry_products for select to authenticated
 using ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=shop_id and m.user_id=(select auth.uid())));
create policy jewelry_products_insert on public.jewelry_products for insert to authenticated
 with check ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=shop_id and m.user_id=(select auth.uid())));
create policy jewelry_products_update on public.jewelry_products for update to authenticated
 using ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=shop_id and m.user_id=(select auth.uid())))
 with check ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id=shop_id and m.user_id=(select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('jewelry-private','jewelry-private',false,10485760,array['image/jpeg','image/png','image/webp'])
 on conflict (id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('jewelry-public','jewelry-public',true,10485760,array['image/png','image/jpeg','image/webp'])
 on conflict (id) do nothing;
create policy jewelry_private_read on storage.objects for select to authenticated
 using (bucket_id='jewelry-private' and ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid()))));
create policy jewelry_private_upload on storage.objects for insert to authenticated
 with check (bucket_id='jewelry-private' and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/source[.](jpg|png|webp)$' and ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid()))));

-- A signed-in shop user may edit product details and attach only that product's source.
-- Publication and candidate paths are written solely by the authenticated server API.
alter table public.jewelry_products add constraint jewelry_source_owns_path
 check (source_path is null or (split_part(source_path,'/',1)=shop_id::text and split_part(source_path,'/',2)=id::text and source_path ~ '/source[.](jpg|png|webp)$'));
revoke update on public.jewelry_products from authenticated;
grant update (title,category,description,style,source_path) on public.jewelry_products to authenticated;
revoke insert on public.jewelry_products from authenticated;
grant insert (shop_id,title,category,description,style,created_by) on public.jewelry_products to authenticated;

-- The server atomically claims one of two image attempts before calling the provider.
-- A retry never bypasses the quota even if several requests arrive together.
alter table public.jewelry_products add column generation_claimed_at timestamptz;
create or replace function public.jewelry_claim_generation(p_id uuid)
returns public.jewelry_products language plpgsql security definer set search_path = public as $$
declare v_product public.jewelry_products;
begin
 update public.jewelry_products p set status='generating',generation_count=p.generation_count+1,generation_claimed_at=now(),updated_at=now()
 where p.id=p_id and p.source_path is not null and p.generation_count<2 and p.status in ('draft','review')
 returning p.* into v_product;
 return v_product;
end $$;
revoke all on function public.jewelry_claim_generation(uuid) from public,anon,authenticated;
grant execute on function public.jewelry_claim_generation(uuid) to service_role;

create or replace function public.jewelry_assign_member(p_shop uuid,p_email text)
returns boolean language plpgsql security definer set search_path = public, auth as $$
declare v_user uuid;
begin
 select id into v_user from auth.users where lower(email)=lower(trim(p_email)) limit 1;
 if v_user is null then return false; end if;
 insert into public.jewelry_members(shop_id,user_id,role) values(p_shop,v_user,'editor')
 on conflict(shop_id,user_id) do nothing;
 return true;
end $$;
revoke all on function public.jewelry_assign_member(uuid,text) from public,anon,authenticated;
grant execute on function public.jewelry_assign_member(uuid,text) to service_role;
