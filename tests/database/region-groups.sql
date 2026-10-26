\set ON_ERROR_STOP on
begin;
-- Disposable fixture needs thirteen approved records; production limits stay unchanged.
update public.site_settings set value=jsonb_set(value,'{daily_submissions}','20'::jsonb) where key='posting';
insert into public.locations(id,name_en,name_zh,state,city) values
 ('fixture-nj-outside','Isolated other NJ city','隔离测试地区','NJ','Isolated city'),
 ('fixture-ny-outside','Isolated other NY city','隔离测试地区','NY','Isolated city');
insert into auth.users(id,email_confirmed_at) values('00000000-0000-4000-8000-000000000031',now()),('00000000-0000-4000-8000-000000000032',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000032','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000031',true);
set local role authenticated;
insert into public.listings(category_id,subcategory,location_id,title,description,price,status,details)
 select 'marketplace','furniture',id,'Isolated group fixture '||id,'This is an isolated database test record and must never be published to a real service.',row_number() over(order by id),'pending','{"condition":"good","pickup":"Test only"}'::jsonb
 from public.locations where id in ('manhattan','brooklyn','queens','bronx','staten-island','flushing','jersey-city','hoboken','weehawken','union-city','west-new-york','fixture-nj-outside','fixture-ny-outside');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000032',true);
set local role authenticated;
select public.moderate_listing(id,'approved','Disposable group fixture review') from public.listings where title like 'Isolated group fixture %';
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$declare r jsonb; first_page jsonb; second_page jsonb;begin
 r=public.search_listings_by_state('marketplace','{"state":"NY","location":"nyc"}',24,0);
 if (r->>'total')::int<>6 then raise exception 'NYC group must include five boroughs and their local areas';end if;
 r=public.search_listings_by_region('marketplace','{"state":"NJ","location":"nj-near-manhattan","sort":"price-low"}',24,0);
 if (r->>'total')::int<>5 or jsonb_array_length(r->'items')<>5 then raise exception 'NJ group must include exactly its five cities';end if;
 if exists(select 1 from jsonb_array_elements(r->'items') item where item->>'location_id' not in ('jersey-city','hoboken','weehawken','union-city','west-new-york')) then raise exception 'Outside city entered NJ group';end if;
 if (public.search_listings_by_region('marketplace','{"state":"NY","location":"nj-near-manhattan"}',24,0)->>'total')::int<>0 then raise exception 'Group crossed state boundary';end if;
 first_page=public.search_listings_by_region('marketplace','{"state":"NJ","location":"nj-near-manhattan","sort":"price-low"}',2,0);
 second_page=public.search_listings_by_region('marketplace','{"state":"NJ","location":"nj-near-manhattan","sort":"price-low"}',2,2);
 if (first_page->>'total')::int<>5 or (second_page->>'total')::int<>5 then raise exception 'Group totals changed with pagination';end if;
 if first_page->'items'<>jsonb_build_array(r->'items'->0,r->'items'->1) or second_page->'items'<>jsonb_build_array(r->'items'->2,r->'items'->3) then raise exception 'Group ordering or pagination failed';end if;
 if (public.search_listings_by_region('marketplace','{"state":"NJ","location":"nj-near-manhattan","q":"nothing-matches"}',24,0)->>'total')::int<>0 then raise exception 'Keyword filter lost inside group';end if;
end$$;
reset role;
rollback;
\echo 'PASS: selectable region groups include all children, exclude outside cities and preserve keyword search, counts, ordering and pagination'
