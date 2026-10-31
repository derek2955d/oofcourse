\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email_confirmed_at) values('00000000-0000-4000-8000-000000000051',now()),('00000000-0000-4000-8000-000000000052',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000052','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000051',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,status,details) values
 ('60000000-0000-4000-8000-000000000001','community','outings','beacon','Disposable Beacon outing','This is a disposable database test fixture and must never be published to any hosted service.',100,'pending','{"topic":"Weekend fixture","outing_type":"art","outing_place":"Test location only","outing_area":"nj"}'),
 ('60000000-0000-4000-8000-000000000002','community','outings','hoboken','Disposable NJ outing draft','This is a disposable database test fixture and must never be published to any hosted service.',100,'draft','{"topic":"Weekend fixture","outing_type":"waterfront","outing_place":"Test location only"}');
do $$begin
 if (select details->>'outing_area' from public.listings where id='60000000-0000-4000-8000-000000000001')<>'hudson' then raise exception 'Author-supplied destination region was trusted';end if;
 if (select price from public.listings where id='60000000-0000-4000-8000-000000000001') is not null then raise exception 'Outing guide became a ticket price';end if;
 begin
  update public.listings set details='{"topic":"Weekend fixture","outing_type":"fake","outing_place":"Test only"}' where id='60000000-0000-4000-8000-000000000001';
  raise exception 'Invalid outing accepted';
 exception when others then if sqlerrm='Invalid outing accepted' then raise;end if;end;
 begin
  update public.listings set status='approved' where id='60000000-0000-4000-8000-000000000001';
  raise exception 'Self-approval accepted';
 exception when others then if sqlerrm='Self-approval accepted' then raise;end if;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin if exists(select 1 from public.listings where subcategory='outings') then raise exception 'Pending/draft outing leaked';end if;end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000052',true);
set local role authenticated;
select public.moderate_listing('60000000-0000-4000-8000-000000000001','approved','Reviewed isolated outing fixture');
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$declare n int;begin
 select count(*) into n from public.listings where category_id='community' and subcategory='outings' and status='approved' and expires_at>now() and details->>'outing_area'='hudson' and details->>'outing_type'='art';
 if n<>1 then raise exception 'Reviewed outing could not be filtered';end if;
 if exists(select 1 from public.listings where id='60000000-0000-4000-8000-000000000002') then raise exception 'Other private draft leaked';end if;
end$$;
reset role;
rollback;
\echo 'PASS: outing drafts, verified submission, truthful destination derivation, no guide price, invalid-type rejection, audited approval and public filters'
