\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000081',now()),
 ('00000000-0000-4000-8000-000000000082',now()),
 ('00000000-0000-4000-8000-000000000083',now());
insert into public.user_roles values('00000000-0000-4000-8000-000000000083','admin');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000081',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,price,status,details)
 values('10000000-0000-4000-8000-000000000081','community','announcements','nyc',
        'Private review feedback fixture','Disposable private review feedback fixture for isolated permission tests only.',
        null,'pending','{"topic":"Internal fixture"}');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000083',true);
set local role authenticated;
select public.moderate_listing('10000000-0000-4000-8000-000000000081','rejected','First review: clarify the announcement.');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000081',true);
set local role authenticated;
do $$begin
 if (select reason from public.moderation_actions
     where listing_id='10000000-0000-4000-8000-000000000081' and action='rejected')
    <> 'First review: clarify the announcement.' then
   raise exception 'Owner cannot read their review feedback';
 end if;
end$$;
update public.listings set status='draft',description='Updated private fixture after review; never a real community announcement.'
 where id='10000000-0000-4000-8000-000000000081';
update public.listings set status='pending' where id='10000000-0000-4000-8000-000000000081';
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000083',true);
set local role authenticated;
select public.moderate_listing('10000000-0000-4000-8000-000000000081','rejected','Second review: add the missing context.');
reset role;
-- now() is fixed within this test transaction: give history deterministic dates.
update public.moderation_actions set created_at=now()-interval '1 minute'
 where listing_id='10000000-0000-4000-8000-000000000081' and reason='First review: clarify the announcement.';

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000081',true);
set local role authenticated;
do $$begin
 if (select reason from public.moderation_actions
     where listing_id='10000000-0000-4000-8000-000000000081' and action='rejected'
     order by created_at desc limit 1) <> 'Second review: add the missing context.' then
   raise exception 'Latest owner feedback was not selected';
 end if;
end$$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000082',true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.moderation_actions
           where listing_id='10000000-0000-4000-8000-000000000081') then
   raise exception 'Another account can read private review feedback';
 end if;
end$$;
reset role;
set local role anon;
do $$begin
 begin
   perform reason from public.moderation_actions
    where listing_id='10000000-0000-4000-8000-000000000081';
   raise exception 'Anonymous account can query private review feedback';
 exception when insufficient_privilege then null;
 end;
end$$;
reset role;
rollback;
\echo 'PASS: owner reads latest rejection, can edit/resubmit, other accounts and anon cannot read feedback'
