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
