alter table public.jewelry_products
 add column video_status text not null default 'draft' check(video_status in ('draft','processing','review','published','failed')),
 add column video_job_id text,
 add column video_reference_path text,
 add column video_candidate_path text,
 add column video_public_path text,
 add column video_attempts int not null default 0 check(video_attempts between 0 and 1),
 add column video_approved_by uuid references auth.users(id),
 add column video_approved_at timestamptz;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('jewelry-video-private','jewelry-video-private',false,52428800,array['video/mp4']),
 ('jewelry-video-public','jewelry-video-public',true,52428800,array['video/mp4']) on conflict(id) do nothing;
create policy jewelry_video_private_read on storage.objects for select to authenticated using(bucket_id='jewelry-video-private' and ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid()))));
create policy jewelry_video_reference_upload on storage.objects for insert to authenticated with check(bucket_id='jewelry-private' and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}/video-reference-[a-f0-9-]{36}[.]png$' and ((select public.vertex_is_admin()) or exists(select 1 from public.jewelry_members m where m.shop_id::text=split_part(name,'/',1) and m.user_id=(select auth.uid()))));
create or replace function public.jewelry_claim_video(p_id uuid,p_reference text)
returns public.jewelry_products language plpgsql security definer set search_path=public as $$
declare p public.jewelry_products;
begin
 update public.jewelry_products j set video_status='processing',video_attempts=1,video_reference_path=p_reference
 where j.id=p_id and j.status in ('review','published') and j.candidate_path is not null and j.video_status in ('draft','failed') and j.video_attempts=0
 and split_part(p_reference,'/',1)=j.shop_id::text and split_part(p_reference,'/',2)=j.id::text and p_reference ~ '/video-reference-[a-f0-9-]{36}[.]png$'
 returning j.* into p;
 return p;
end $$;
revoke all on function public.jewelry_claim_video(uuid,text) from public,anon,authenticated;
grant execute on function public.jewelry_claim_video(uuid,text) to service_role;
