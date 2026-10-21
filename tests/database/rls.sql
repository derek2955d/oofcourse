\set ON_ERROR_STOP on
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000001');
insert into public.categories(id,slug,name) values ('10000000-0000-0000-0000-000000000001','test','Test');
insert into public.deal_sources(id,name,merchant,source_type,enabled,affiliate_approved) values ('20000000-0000-0000-0000-000000000001','Test Source','Test Merchant','manual',true,true);
insert into public.products(name,slug,description,category_id,source_id,merchant,image_license,affiliate_url,status,is_demo,last_checked_at,expires_at) values
('Live','live','Test','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Test','Owned','https://amazon.com/test','active',false,now(),now()+interval '1 day'),
('Expired','expired','Test','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Test','Owned','https://amazon.com/test','active',false,now(),now()-interval '1 day'),
('Stale','stale','Test','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Test','Owned','https://amazon.com/test','active',false,now()-interval '2 days',now()+interval '1 day');
insert into public.products(name,slug,description,category_id,merchant) values ('Demo','demo','Test','10000000-0000-0000-0000-000000000001','Test');
set local role anon;
do $$begin
 if (select count(*) from public.products)<>1 then raise exception 'Anon must see only current verified live offer'; end if;
 if has_table_privilege('anon','public.products','INSERT') then raise exception 'Anon must not have write access'; end if;
 if has_table_privilege('anon','public.deal_checks','SELECT') then raise exception 'Anon must not read checks'; end if;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
set local role authenticated;
do $$begin
 if (select count(*) from public.admin_users)<>0 then raise exception 'Member should not read admin membership'; end if;
 begin
  insert into public.products(name,slug,description,category_id,merchant) values ('Unauthorized','unauthorized','Test','10000000-0000-0000-0000-000000000001','Test');
  raise exception 'Nonadmin write unexpectedly allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000002');
  raise exception 'Privilege escalation unexpectedly allowed';
 exception when insufficient_privilege then null;
 end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$begin
 if (select count(*) from public.products)<>4 then raise exception 'Admin should see all records'; end if;
 insert into public.products(name,slug,description,category_id,merchant) values ('Admin draft','admin-draft','Test','10000000-0000-0000-0000-000000000001','Test');
 update public.products set description='Updated' where slug='admin-draft';
 delete from public.products where slug='admin-draft';
end$$;
reset role;
update public.deal_sources set enabled=false;
set local role anon;
do $$begin if (select count(*) from public.products)<>0 then raise exception 'Disabled source must hide offer'; end if; end$$;
reset role;
rollback;
\echo 'PASS: anon visibility, write denial, nonadmin isolation, escalation denial, admin writes, and source gating'
