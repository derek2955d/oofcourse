\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email_confirmed_at) values('00000000-0000-4000-8000-000000000061',now()),('00000000-0000-4000-8000-000000000062',now());
insert into public.user_roles(user_id,role) values('00000000-0000-4000-8000-000000000061','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000062',true);
set local role authenticated;
do $$begin
 begin perform public.reserve_assistant_generation();raise exception 'member unexpectedly allowed';exception when others then if sqlerrm='member unexpectedly allowed' then raise;end if;end;
 begin perform public.save_assistant_activity('https://example.org/event',repeat('Public fixture ',10),'Event fixture title',repeat('Original fixture description. ',3),current_date+30,'queens','{}','en');raise exception 'member unexpectedly saved';exception when others then if sqlerrm='member unexpectedly saved' then raise;end if;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000061',true);
set local role authenticated;
do $$declare first_id uuid;second_id uuid;begin
 perform public.reserve_assistant_generation();
 first_id:=public.save_assistant_activity('https://example.org/event',repeat('Public fixture ',10),'Event fixture title',repeat('Original fixture description. ',3),current_date+30,'queens','{}','en');
 second_id:=public.save_assistant_activity('https://example.org/event',repeat('Public fixture ',10),'Event fixture title',repeat('Original fixture description. ',3),current_date+30,'queens','{}','en');
 if first_id<>second_id then raise exception 'duplicate source produced two drafts';end if;
 if not exists(select 1 from public.listings where id=first_id and status='draft' and price is null and published_at is null) then raise exception 'draft publication boundary failed';end if;
 if (select count(*) from public.assistant_imports)<>1 then raise exception 'provenance missing';end if;
 if not exists(select 1 from public.audit_logs where record_id=first_id::text and operation='CREATE_DRAFT') then raise exception 'audit missing';end if;
 for i in 1..9 loop perform public.reserve_assistant_generation();end loop;
 begin perform public.reserve_assistant_generation();raise exception 'quota unexpectedly allowed';exception when others then if sqlerrm='quota unexpectedly allowed' then raise;end if;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000062',true);
set local role authenticated;
do $$begin if exists(select 1 from public.assistant_imports) then raise exception 'private source leaked';end if;end$$;
reset role;
set local role anon;
do $$begin if exists(select 1 from public.listings where title='Event fixture title') then raise exception 'public draft leak';end if;end$$;
rollback;
