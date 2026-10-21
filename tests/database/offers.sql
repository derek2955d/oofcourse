\set ON_ERROR_STOP on
begin;
insert into public.categories(id,slug,name,name_zh) values ('10000000-0000-0000-0000-000000000001','test','Test','测试');
insert into public.retailers(id,name,slug,homepage_url,allowed_hosts,enabled,affiliate_approved) values
('30000000-0000-0000-0000-000000000001','Independent A','independent-a','https://a.example',array['a.example'],true,true),
('30000000-0000-0000-0000-000000000002','Independent B','independent-b','https://b.example',array['b.example'],true,true);
insert into public.deal_sources(id,name,merchant,source_type,enabled,affiliate_approved,retailer_id) values
('20000000-0000-0000-0000-000000000001','A feed','A','manual',true,true,'30000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002','B feed','B','manual',true,true,'30000000-0000-0000-0000-000000000002');
insert into public.products(id,name,name_zh,slug,description,category_id,image_license,status,is_demo,content_scope) values
('40000000-0000-0000-0000-000000000001','Shared identity','共享商品','shared-identity','Owned editorial description','10000000-0000-0000-0000-000000000001','Owned','published',false,'neutral');
insert into public.offers(id,product_id,retailer_id,source_id,status,is_demo,image_license,content_scope,content_retailer_id,last_checked_at,expires_at) values
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','published',false,'Licensed A','retailer_restricted','30000000-0000-0000-0000-000000000001',now(),now()+interval '1 day'),
('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','published',false,'Licensed B','retailer_restricted','30000000-0000-0000-0000-000000000002',now(),now()+interval '1 day');
insert into public.affiliate_links(offer_id,product_id,retailer_id,source_id,url,enabled,approved,checked_at,expires_at) values
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','https://a.example/item',true,true,now(),now()+interval '1 day'),
('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','https://b.example/item',true,true,now(),now()+interval '1 day');
set local role anon;
do $$begin
 if (select count(*) from public.products)<>1 or (select count(*) from public.offers)<>2 or (select count(*) from public.affiliate_links)<>2 then raise exception 'Neutral identity must support two independent retailer offers';end if;
 if (select name_zh from public.products limit 1)<>'共享商品' then raise exception 'Missing Chinese shared identity';end if;
end$$;
reset role;
update public.products set content_scope='retailer_restricted',content_retailer_id='30000000-0000-0000-0000-000000000001';
set local role anon;
do $$begin if (select count(*) from public.offers)<>1 or (select count(*) from public.affiliate_links)<>1 then raise exception 'Retailer-restricted content must not promote another retailer';end if;end$$;
reset role;
update public.products set content_scope='neutral',content_retailer_id=null;
do $$begin
 begin
 update public.offers set current_price=10 where id='50000000-0000-0000-0000-000000000001';
 raise exception 'Unauthorized price accepted';exception when check_violation then null;end;
 begin
 update public.offers set content_retailer_id='30000000-0000-0000-0000-000000000002' where id='50000000-0000-0000-0000-000000000001';
 raise exception 'Cross-retailer content accepted';exception when check_violation then null;end;
 begin
 update public.affiliate_links set offer_id='50000000-0000-0000-0000-000000000002' where url='https://a.example/item';
 raise exception 'Cross-offer link accepted';exception when foreign_key_violation then null;end;
end$$;
update public.offers set last_checked_at=now()-interval '2 days';
set local role anon;
do $$begin if exists(select 1 from public.products) or exists(select 1 from public.offers) or exists(select 1 from public.affiliate_links) then raise exception 'Stale offers must be hidden';end if;end$$;
reset role;
set local role authenticated;
do $$begin
 begin
 insert into public.offers(product_id,retailer_id,source_id,content_scope) values ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','neutral');
 raise exception 'Unauthenticated admin write accepted';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
\echo 'PASS: bilingual identity, generic multi-offer, licensed content isolation, exact affiliate provenance, freshness, RLS'
