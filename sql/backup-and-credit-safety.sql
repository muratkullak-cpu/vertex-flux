-- Restore columns actually present in the export, so older exports still use new defaults.
create or replace function public.vertex_restore_missing(p_backup jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare tbl text;cnt int;summary jsonb:='{}';entries jsonb;cols text;seq text;
begin
 if not public.vertex_is_admin() or auth.uid() is null then raise exception 'Yetki yok';end if;
 if p_backup->>'format' is distinct from 'vertex-flux-backup-v1' then raise exception 'Geçersiz yedek';end if;
 foreach tbl in array array['clients','subscriptions','properties','quotes','jobs','quote_items','tasks','payments','qr_links','market_sources','cost_entries','credit_ledger','subscription_periods','client_updates','client_files','jewelry_shops','jewelry_members','jewelry_products','jewelry_branches','jewelry_favorites','jewelry_comments','jewelry_followers','jewelry_notifications','jewelry_updates','jewelry_daily_rights','jewelry_image_credit_ledger','audit_logs'] loop
  entries:=p_backup->'tables'->tbl;
  if entries is null then
   if tbl in ('clients','properties','quotes','jobs','quote_items','tasks','payments','qr_links') then raise exception 'Yedekte % eksik',tbl;end if;
   continue;
  end if;
  if jsonb_typeof(entries)<>'array' then raise exception 'Geçersiz tablo verisi: %',tbl;end if;
  if jsonb_array_length(entries)=0 then summary:=summary||jsonb_build_object(tbl,0);continue;end if;
  select string_agg(format('%I',a.attname),',' order by a.attnum) into cols from pg_attribute a
  where a.attrelid=format('public.%I',tbl)::regclass and a.attnum>0 and not a.attisdropped and (entries->0 ? a.attname);
  if cols is null then raise exception 'Geçersiz yedek sütunları';end if;
  execute format('insert into public.%I (%s) select %s from jsonb_populate_recordset(null::public.%I,$1) on conflict do nothing',tbl,cols,cols,tbl) using entries;
  get diagnostics cnt=row_count;summary:=summary||jsonb_build_object(tbl,cnt);
 end loop;
 if jsonb_typeof(p_backup->'pricing_settings')='array' then
  insert into public.pricing_settings(key,value) select x.key,x.value from jsonb_to_recordset(p_backup->'pricing_settings') as x(key text,value jsonb) on conflict(key) do nothing;
  get diagnostics cnt=row_count;summary:=summary||jsonb_build_object('pricing_settings',cnt);
 end if;
 seq:=pg_get_serial_sequence('public.audit_logs','id');
 if seq is not null then perform setval(seq::regclass,greatest(coalesce((select max(id) from public.audit_logs),1),coalesce(pg_sequence_last_value(seq::regclass),1)),true);end if;
 return summary;
end $$;
revoke all on function public.vertex_restore_missing(jsonb) from public,anon;
grant execute on function public.vertex_restore_missing(jsonb) to authenticated;
create or replace function public.vertex_adjust_credit(p_client uuid,p_amount numeric,p_note text)
returns numeric language plpgsql security definer set search_path=public as $$
declare balance numeric;
begin
 if not public.vertex_is_admin() or auth.uid() is null then raise exception 'Yetki yok';end if;
 if p_amount=0 or p_amount is null or length(trim(p_note))<2 then raise exception 'Geçersiz kredi işlemi';end if;
 perform 1 from public.clients where id=p_client for update;if not found then raise exception 'Müşteri yok';end if;
 select coalesce(sum(amount),0) into balance from public.credit_ledger where client_id=p_client;
 if balance+p_amount<0 then raise exception 'Kredi bakiyesi eksiye düşemez';end if;
 insert into public.credit_ledger(client_id,amount,note,created_by) values(p_client,p_amount,p_note,auth.uid());
 return balance+p_amount;
end $$;
revoke insert on public.credit_ledger from authenticated;
revoke all on function public.vertex_adjust_credit(uuid,numeric,text) from public,anon;
grant execute on function public.vertex_adjust_credit(uuid,numeric,text) to authenticated;
-- Renewal inserts now run under the explicit admin checks in each function.
alter function public.vertex_receive_subscription(uuid,text) security definer;
alter function public.vertex_renew_subscription(uuid) security definer;
create or replace function public.vertex_property_subscription_match() returns trigger language plpgsql set search_path=public as $$
begin
 if new.subscription_id is not null and not exists(select 1 from public.subscriptions where id=new.subscription_id and client_id=new.client_id) then raise exception 'Abonelik bu müşteriye ait değil';end if;
 return new;
end $$;
revoke all on function public.vertex_property_subscription_match() from public,anon,authenticated;
create trigger vertex_property_subscription_match before insert or update on public.properties for each row execute function public.vertex_property_subscription_match();
