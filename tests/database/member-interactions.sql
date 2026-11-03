\set ON_ERROR_STOP on
begin;
-- Disposable database only. All identities and content roll back.
insert into auth.users(id,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000091',now()),
 ('00000000-0000-4000-8000-000000000092',now()),
 ('00000000-0000-4000-8000-000000000093',now()),
 ('00000000-0000-4000-8000-000000000094',now());
insert into public.user_roles values('00000000-0000-4000-8000-000000000094','admin');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000091',true);
set local role authenticated;
insert into public.listings(id,category_id,subcategory,location_id,title,description,status,details)
 values('10000000-0000-4000-8000-000000000091','community','announcements','nyc',
 'Isolated interaction fixture','Disposable database-only content for message, favorite and report boundaries.',
 'pending','{"topic":"Isolated test"}');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000094',true);
set local role authenticated;
select public.moderate_listing('10000000-0000-4000-8000-000000000091','approved','Isolated test approval only');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000092',true);
set local role authenticated;
insert into public.favorites(listing_id) values('10000000-0000-4000-8000-000000000091');
select set_config('test.interaction_conversation',public.contact_publisher('10000000-0000-4000-8000-000000000091','Isolated private requester message only.')::text,true);
select public.contact_publisher('10000000-0000-4000-8000-000000000091','Second message reuses the existing conversation.');
insert into public.reports(listing_id,reason,description) values('10000000-0000-4000-8000-000000000091','other','Isolated reporting test, not a real allegation.');
do $$declare n int;begin
 if (select count(*) from public.conversations)<>1 or (select count(*) from public.messages)<>2 then raise exception 'Contact did not reuse conversation';end if;
 begin insert into public.messages(conversation_id,sender_id,body) values(current_setting('test.interaction_conversation')::uuid,'00000000-0000-4000-8000-000000000091','Forged sender must never be accepted.');raise exception 'Sender impersonation accepted';exception when insufficient_privilege then null;when raise_exception then if sqlerrm<>'Participant access required' then raise;end if;end;
 update public.reports set status='resolved',resolution='Unauthorized reporter resolution';get diagnostics n=row_count;if n<>0 then raise exception 'Reporter resolved own report';end if;
 begin insert into public.reports(listing_id,reason,description) values('10000000-0000-4000-8000-000000000091','other','Duplicate report must not be accepted.');raise exception 'Duplicate report accepted';exception when unique_violation then null;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000091',true);
set local role authenticated;
do $$declare n int;begin
 if (select count(*) from public.messages)<>2 then raise exception 'Publisher cannot read conversation';end if;
 if exists(select 1 from public.reports) or exists(select 1 from public.favorites) then raise exception 'Publisher saw reporter identity or favorite';end if;
 delete from public.favorites where listing_id='10000000-0000-4000-8000-000000000091';get diagnostics n=row_count;if n<>0 then raise exception 'Publisher removed another user favorite';end if;
 begin perform public.contact_publisher('10000000-0000-4000-8000-000000000091','Self contact must not be accepted.');raise exception 'Self contact accepted';exception when raise_exception then if sqlerrm<>'Cannot contact yourself' then raise;end if;end;
end$$;
insert into public.messages(conversation_id,body) values(current_setting('test.interaction_conversation')::uuid,'Isolated publisher reply to requester only.');
reset role;
-- Ordinary unrelated member AND administrator remain outside this conversation.
do $$declare uid text;begin
 foreach uid in array array['00000000-0000-4000-8000-000000000093','00000000-0000-4000-8000-000000000094'] loop
 perform set_config('request.jwt.claim.sub',uid,true);
 execute 'set local role authenticated';
 if exists(select 1 from public.messages) or exists(select 1 from public.conversations) or exists(select 1 from public.favorites) then raise exception 'Nonparticipant private data leak';end if;
 begin insert into public.messages(conversation_id,body) values(current_setting('test.interaction_conversation')::uuid,'Outsider insertion must never be accepted.');raise exception 'Outsider message accepted';exception when insufficient_privilege then null;when raise_exception then if sqlerrm<>'Participant access required' then raise;end if;end;
 execute 'reset role';
 end loop;
end$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000094',true);
set local role authenticated;
update public.reports set status='resolved',resolution='Isolated report reviewed by administrator.' where listing_id='10000000-0000-4000-8000-000000000091';
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000092',true);
set local role authenticated;
do $$begin
 if (select count(*) from public.messages)<>3 then raise exception 'Requester cannot read publisher reply';end if;
 if not exists(select 1 from public.reports where status='resolved' and resolution='Isolated report reviewed by administrator.') then raise exception 'Admin resolution unavailable to reporter';end if;
end$$;
delete from public.favorites where listing_id='10000000-0000-4000-8000-000000000091';
do $$begin if exists(select 1 from public.favorites) then raise exception 'Owner could not unsave favorite';end if;end$$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
 begin perform public.contact_publisher('10000000-0000-4000-8000-000000000091','Anonymous contact must never be accepted.');raise exception 'Anonymous contact accepted';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
\echo 'PASS: contact/reply, conversation reuse, sender integrity, nonparticipant/admin isolation, private favorites, reporter privacy and administrator resolution'
