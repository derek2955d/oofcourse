\set ON_ERROR_STOP on
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
insert into public.admin_users(user_id,role) values ('00000000-0000-0000-0000-000000000001','admin');
insert into public.categories(id,slug,name) values ('10000000-0000-0000-0000-000000000001','test','Test');
insert into public.retailers(id,name,slug,homepage_url,allowed_hosts,enabled,affiliate_approved) values
('30000000-0000-0000-0000-000000000001','Amazon test','amazon-test','https://www.amazon.com',array['www.amazon.com'],true,true),
('30000000-0000-0000-0000-000000000002','Walmart test','walmart-test','https://www.walmart.com',array['www.walmart.com'],true,true);
insert into public.deal_sources(id,name,merchant,source_type,enabled,affiliate_approved,retailer_id) values
('20000000-0000-0000-0000-000000000001','Amazon source','Amazon','manual',true,true,'30000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002','Walmart source','Walmart','manual',true,true,'30000000-0000-0000-0000-000000000002');
insert into public.products(id,name,slug,description,category_id,source_id,retailer_id,merchant,image_license,status,is_demo,last_checked_at,expires_at) values
('40000000-0000-0000-0000-000000000001','Live candidate','live-candidate','Test','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Amazon','Owned','published',false,now(),now()+interval '1 day');
set local role anon;
do $$begin if (select count(*) from public.products)<>0 then raise exception 'Missing approved link must hide published product';end if;end$$;
reset role;
insert into public.affiliate_links(product_id,retailer_id,source_id,url,enabled,approved,checked_at,expires_at) values
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','https://www.amazon.com/example',true,true,now(),now()+interval '1 day');
-- A same-retailer link from a different source must remain private, even when
-- another valid link makes the product visible.
insert into public.deal_sources(id,name,merchant,source_type,enabled,affiliate_approved,retailer_id) values ('20000000-0000-0000-0000-000000000003','Other Amazon source','Amazon','manual',true,true,'30000000-0000-0000-0000-000000000001');
insert into public.affiliate_links(product_id,retailer_id,source_id,url,enabled,approved,checked_at,expires_at) values ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','https://www.amazon.com/other-source',true,true,now(),now()+interval '1 day');
set local role anon;
do $$begin
 if (select count(*) from public.products)<>1 then raise exception 'Approved current offer should be readable';end if;
 if (select count(*) from public.affiliate_links)<>1 then raise exception 'Approved link should be readable';end if;
 if has_table_privilege('anon','public.analytics_events','INSERT') then raise exception 'Anonymous analytics writes must not be granted';end if;
 if has_table_privilege('anon','public.admin_audit_log','SELECT') then raise exception 'Audit log must be private';end if;
end$$;
reset role;
do $$begin
 begin
 insert into public.affiliate_links(product_id,retailer_id,source_id,url) values ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','https://www.walmart.com/example');
 raise exception 'Cross-retailer link unexpectedly accepted';
 exception when foreign_key_violation then null;end;
 begin
 insert into public.affiliate_links(product_id,retailer_id,source_id,url) values ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','https://www.amazon.com.evil.test/example');
 raise exception 'Unapproved host unexpectedly accepted';
 exception when raise_exception then if sqlerrm<>'Affiliate destination must match approved retailer host' then raise;end if;end;
 begin
 update public.products set current_price=10 where slug='live-candidate';
 raise exception 'Unauthorized price unexpectedly accepted';
 exception when check_violation then null;end;
end$$;
update public.affiliate_links set checked_at=now()-interval '2 days';
set local role anon;
do $$begin if (select count(*) from public.products)<>0 or (select count(*) from public.affiliate_links)<>0 then raise exception 'Stale links must hide offer';end if;end$$;
reset role;
update public.affiliate_links set checked_at=now();
update public.retailers set affiliate_approved=false where slug='amazon-test';
set local role anon;
do $$begin if (select count(*) from public.products)<>0 then raise exception 'Revoked program approval must hide offer';end if;end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
set local role authenticated;
do $$begin
 begin
 insert into public.retailers(name,slug,homepage_url) values ('Not authorized','not-authorized','https://example.com');
 raise exception 'Nonadmin retailer write unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 if (select count(*) from public.admin_audit_log)<>0 then raise exception 'Nonadmin may not read audit logs';end if;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$begin
 if (select count(*) from public.admin_audit_log)<1 then raise exception 'Admin writes must be audited';end if;
 update public.products set status='archived' where slug='live-candidate';
end$$;
reset role;
rollback;
\echo 'PASS: multi-retailer provenance, safe hosts, no unapproved prices, freshness, program approval, roles, audit protection'
