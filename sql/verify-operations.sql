-- Verification only: all fixture rows are rolled back. No email, payment or provider call.
begin;
do $$
declare u uuid:=gen_random_uuid();c uuid:=gen_random_uuid();s uuid:=gen_random_uuid();p uuid:=gen_random_uuid();qr uuid:=gen_random_uuid();quote uuid;job uuid;payment uuid;slug text:='fixture-'||gen_random_uuid();dest text;due date:=(now() at time zone 'Europe/Istanbul')::date;n int;failed boolean;
begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,'fixture-'||u||'@invalid.test','{}');
 update public.profiles set role='admin' where id=u;
 insert into public.clients(id,name,sector,status) values(c,'Rollback operations fixture','emlak','aktif');
 perform set_config('request.jwt.claim.sub',u::text,true);
 set local role authenticated;
 perform public.vertex_set_pin('123456');
 if not public.vertex_verify_pin('123456') then raise exception 'PIN valid check failed';end if;
 for n in 1..5 loop if public.vertex_verify_pin('000000') then raise exception 'Invalid PIN accepted';end if;end loop;
 if public.vertex_verify_pin('123456') then raise exception 'PIN lockout failed';end if;
 insert into public.subscriptions(id,client_id,plan_name,monthly_price,monthly_credits,next_renewal,billing_period,auto_suspend,created_by) values(s,c,'Annual fixture',1000,2,due,'yearly',true,u);
 insert into public.properties(id,client_id,title,subscription_id,created_by) values(p,c,'Fixture property',s,u);
 insert into public.qr_links(id,slug,title,target_url,property_id,client_id,created_by) values(qr,slug,'Fixture QR','https://example.com',p,c,u);
 dest:=public.vertex_resolve_qr(slug);if dest is not null then raise exception 'Unpaid QR was not suspended';end if;
 perform public.vertex_receive_subscription(s,'Rollback test receipt');
 dest:=public.vertex_resolve_qr(slug);if dest<>'https://example.com' then raise exception 'Paid QR not resumed';end if;
 failed:=false;begin perform public.vertex_receive_subscription(s,'Duplicate receipt');exception when others then failed:=true;end;if not failed then raise exception 'Duplicate period payment accepted';end if;
 select count(*) into n from public.subscription_periods where subscription_id=s;if n<>1 then raise exception 'Duplicate period persisted';end if;
 if (select paid_until from public.subscriptions where id=s)<>(due+interval '1 year')::date then raise exception 'Annual period incorrect';end if;
 failed:=false;begin perform public.vertex_adjust_credit(c,-3,'Overdraw fixture');exception when others then failed:=true;end;if not failed then raise exception 'Credit overdraw allowed';end if;
 quote:=public.vertex_create_quote(c,'emlak','VF-'||upper(replace(u::text,'-','')),'Rollback flow','[{"service_code":"custom","description":"Fixture service","total":1000}]'::jsonb);
 job:=public.vertex_accept_quote(quote);
 perform public.vertex_accept_quote(quote);
 select count(*) into n from public.jobs where quote_id=quote;if n<>1 then raise exception 'Duplicate acceptance created jobs';end if;
 insert into public.payments(client_id,job_id,quote_id,amount,currency,status,created_by) values(c,job,quote,1000,'TRY','bekliyor',u) returning id into payment;
 perform public.vertex_mark_payment(payment);
 if (select status from public.jobs where id=job)<>'odendi' then raise exception 'Paid job transition failed';end if;
 failed:=false;begin perform public.vertex_mark_payment(payment);exception when others then failed:=true;end;if not failed then raise exception 'Duplicate payment accepted';end if;
 reset role;
end $$;
rollback;
select 'PASSED: PIN lockout, yearly receipt, duplicates, QR suspension/resume, credit overdraw, quote acceptance, payment. Fixtures rolled back.' as result;
