begin;
alter table public.listings add column submitted_at timestamptz;
create function private.publication_boundary() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status='draft' or new.status='archived' then new.submitted_at:=null;
 elsif new.status='pending' and new.user_id=auth.uid() then new.submitted_at:=now();
 end if;
 if new.status='approved' and (tg_op='INSERT' or old.status<>'approved') then
 if not private.is_admin() or current_setting('oofcourse.moderation_id',true) is distinct from new.id::text or old.status<>'pending' or old.submitted_at is null then raise exception 'A submitted listing and audited moderation are required';end if;
 if not exists(select 1 from auth.users where id=new.user_id and email_confirmed_at is not null) then raise exception 'Verified publisher required';end if;
 end if;return new;end$$;
create trigger publication_boundary before insert or update on public.listings for each row execute function private.publication_boundary();
create or replace function public.moderate_listing(p_id uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare target public.listings;expiry int;begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 if p_decision not in ('approved','rejected','archived','pending') or length(btrim(p_reason)) not between 3 and 2000 then raise exception 'Invalid moderation decision';end if;
 select * into target from public.listings where id=p_id for update;if not found then raise exception 'Listing missing';end if;
 if p_decision='approved' and (target.status<>'pending' or target.submitted_at is null or not exists(select 1 from public.profiles where id=target.user_id and not posting_restricted)) then raise exception 'Submitted active publisher required';end if;
 expiry:=least(90,greatest(1,coalesce((select (value->>'expiry_days')::int from public.site_settings where key='posting'),30)));
 perform set_config('oofcourse.moderation_id',p_id::text,true);
 update public.listings set status=p_decision,published_at=case when p_decision='approved' then now() else null end,expires_at=case when p_decision='approved' then now()+make_interval(days=>expiry) else null end where id=p_id;
 perform set_config('oofcourse.moderation_id','',true);
 insert into public.moderation_actions(listing_id,moderator_id,action,reason) values(p_id,auth.uid(),p_decision,p_reason);
 insert into public.notifications(user_id,kind,listing_id) values(target.user_id,p_decision,p_id);
end$$;
revoke all on function private.publication_boundary() from public;
create function private.business_boundary() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status='approved' and (tg_op='INSERT' or old.status<>'approved') then
 if not private.is_admin() or current_setting('oofcourse.business_id',true) is distinct from new.id::text or old.status<>'pending' or not exists(select 1 from auth.users where id=new.user_id and email_confirmed_at is not null) then raise exception 'Verified publisher and audited business review required';end if;
 end if;return new;end$$;
create trigger business_boundary before insert or update on public.business_profiles for each row execute function private.business_boundary();
create or replace function public.moderate_business(p_id uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 if p_decision not in ('approved','rejected','archived','pending') or length(btrim(p_reason)) not between 3 and 2000 then raise exception 'Invalid decision';end if;
 perform set_config('oofcourse.business_id',p_id::text,true);
 update public.business_profiles set status=p_decision where id=p_id;if not found then raise exception 'Business missing';end if;
 perform set_config('oofcourse.business_id','',true);
 insert into public.moderation_actions(business_id,moderator_id,action,reason) values(p_id,auth.uid(),p_decision,p_reason);end$$;
revoke all on function private.business_boundary() from public;
commit;
