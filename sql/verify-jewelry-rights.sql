begin;
do $$
declare u uuid:=gen_random_uuid();c uuid:=gen_random_uuid();s uuid:=gen_random_uuid();a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();p public.jewelry_products;again public.jewelry_products;blocked boolean;
begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,'fixture-'||u||'@invalid.test','{}');
 if (select role from profiles where id=u)<>'customer' then raise exception 'Unsafe signup default';end if;
 insert into clients(id,name,sector,status) values(c,'Rollback rights fixture','kuyum','aktif');
 insert into jewelry_shops(id,client_id,slug,name,image_credits) values(s,c,'fixture-'||substr(s::text,1,12),'Fixture',2);
 insert into jewelry_products(id,shop_id,title,category,style,source_path,created_by) values(a,s,'Fixture A','yuzuk','studio',s||'/'||a||'/source.png',u),(b,s,'Fixture B','yuzuk','studio',s||'/'||b||'/source.png',u);
 p:=jewelry_claim_generation(a);if p.claim_free_date is null or p.claim_cost<>0 then raise exception 'Daily free failed';end if;
 again:=jewelry_claim_generation(a);if again.id is not null then raise exception 'Double claim allowed';end if;
 perform jewelry_release_generation(a,p.generation_claimed_at);
 if (select used from jewelry_daily_rights where shop_id=s)<>0 then raise exception 'Free right refund failed';end if;
 p:=jewelry_claim_generation(a);update jewelry_products set status='review',candidate_path=s||'/'||a||'/candidate.png',generation_claimed_at=null,claim_free_date=null where id=a;
 p:=jewelry_claim_generation(a);if p.generation_count<>2 or p.claim_cost<>0 then raise exception 'One regeneration failed';end if;
 update jewelry_products set status='review',generation_claimed_at=null where id=a;
 p:=jewelry_claim_generation(a);if p.claim_cost<>1 or (select image_credits from jewelry_shops where id=s)<>1 then raise exception 'Paid generation failed';end if;
 perform jewelry_release_generation(a,p.generation_claimed_at);perform jewelry_release_generation(a,p.generation_claimed_at);
 if (select image_credits from jewelry_shops where id=s)<>2 then raise exception 'Refund not idempotent';end if;
 p:=jewelry_claim_video(a,s||'/'||a||'/video-reference-'||gen_random_uuid()||'.png');if p.id is null then raise exception 'Video claim failed';end if;
 again:=jewelry_claim_generation(a);if again.id is not null then raise exception 'Image/video race allowed';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);set local role authenticated;
 blocked:=false;begin update jewelry_products set generation_count=0 where id=a;exception when insufficient_privilege then blocked:=true;end;if not blocked then raise exception 'Credit bypass writable';end if;
 reset role;
 if (select count(*) from jewelry_updates where shop_id=s)<>0 then raise exception 'Credit reservation mislabeled branding';end if;
end $$;
rollback;
select 'PASS: signup role, daily right, refund, free regeneration, paid credit, double claim, video exclusion, immutable accounting. Fixtures rolled back.' as result;
