-- NEW development project only. Never apply over the previous affiliate database.
begin;
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon,authenticated;
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null check(length(display_name) between 2 and 80),bio text not null default '' check(length(bio)<=500),posting_restricted boolean not null default false,created_at timestamptz not null default now());
create table public.user_roles(user_id uuid references auth.users(id) on delete cascade,role text not null check(role in ('admin')),primary key(user_id,role));
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role='admin')$$;
create function private.can_post() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and not posting_restricted)$$;
create table public.categories(id text primary key check(id in ('housing','jobs','marketplace','services','businesses','community')),name_en text not null,name_zh text not null,sort_order int not null,enabled boolean not null default true);
create table public.subcategories(id text not null,category_id text references public.categories(id),name_en text not null,name_zh text not null,sort_order int not null default 0,primary key(category_id,id));
create table public.locations(id text primary key,name_en text not null,name_zh text not null,state text not null default 'NY',city text not null default 'New York',borough text,neighborhood text,enabled boolean not null default true);
create table public.listings(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references public.profiles(id),category_id text not null references public.categories(id),subcategory text not null,location_id text not null references public.locations(id),title text not null check(length(title)<=100),description text not null check(length(description)<=6000),price numeric(12,2) check(price>=0),currency text not null default 'USD' check(currency='USD'),status text not null default 'draft' check(status in ('draft','pending','approved','rejected','expired','archived')),details jsonb not null default '{}' check(jsonb_typeof(details)='object' and octet_length(details::text)<=10000),fingerprint text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),published_at timestamptz,expires_at timestamptz,foreign key(category_id,subcategory) references public.subcategories(category_id,id),check(status<>'approved' or (published_at is not null and expires_at is not null and expires_at>published_at)));
create index listings_public_idx on public.listings(category_id,location_id,published_at desc) where status='approved';
create index listings_owner_idx on public.listings(user_id,status,updated_at desc);
create index listings_search_idx on public.listings using gin((title||' '||description) gin_trgm_ops);
create index listings_expiration_idx on public.listings(expires_at) where status='approved';
create table public.housing_details(listing_id uuid primary key references public.listings(id) on delete cascade,tenure text not null check(tenure in ('rent','sale')),property_type text not null check(property_type in ('apartment','house','room','commercial','parking')),bedrooms int not null check(bedrooms between 0 and 30),bathrooms numeric not null check(bathrooms between 0 and 30),furnished text not null check(furnished in ('yes','no','partial')),available_from date not null,fee_disclosure text not null check(length(fee_disclosure) between 10 and 1500),broker_fee_payer text not null check(broker_fee_payer in ('none','landlord','tenant','not-applicable')));
create table public.job_details(listing_id uuid primary key references public.listings(id) on delete cascade,company text not null check(length(company) between 2 and 150),salary_min numeric not null check(salary_min>=0),salary_max numeric not null check(salary_max>=salary_min),pay_period text not null check(pay_period in ('hour','day','week','month','year')),employment text not null check(employment in ('full-time','part-time','internship','contract')),workplace text not null check(workplace in ('on-site','hybrid','remote')),industry text not null check(length(industry) between 2 and 500));
create table public.listing_media(id uuid primary key default gen_random_uuid(),listing_id uuid not null references public.listings(id) on delete cascade,object_path text not null unique,position int not null check(position between 0 and 7),alt text not null default '' check(length(alt)<=150),created_at timestamptz not null default now(),unique(listing_id,position) deferrable initially deferred);
create table public.favorites(user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,listing_id uuid references public.listings(id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,listing_id));
create table public.business_profiles(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),name text not null check(length(name) between 2 and 150),category text not null check(length(category) between 2 and 100),location text not null references public.locations(id),description text not null check(length(description) between 40 and 3000),website text check(website='' or website ~ '^https://'),logo_path text,status text not null default 'pending' check(status in ('pending','approved','rejected','archived')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id));
create table public.conversations(id uuid primary key default gen_random_uuid(),listing_id uuid not null references public.listings(id),requester_id uuid not null references public.profiles(id),publisher_id uuid not null references public.profiles(id),created_at timestamptz not null default now(),unique(listing_id,requester_id),check(requester_id<>publisher_id));
create table public.messages(id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations(id) on delete cascade,sender_id uuid not null default auth.uid() references public.profiles(id),body text not null check(length(body) between 10 and 2000),created_at timestamptz not null default now());
create index messages_conversation_idx on public.messages(conversation_id,created_at);
create table public.reports(id uuid primary key default gen_random_uuid(),listing_id uuid not null references public.listings(id),user_id uuid not null default auth.uid() references public.profiles(id),reason text not null check(reason in ('scam','discrimination','prohibited','misleading','privacy','other')),description text not null check(length(description) between 10 and 2000),status text not null default 'open' check(status in ('open','reviewing','resolved')),resolution text,created_at timestamptz not null default now(),unique(listing_id,user_id));
create table public.moderation_actions(id uuid primary key default gen_random_uuid(),listing_id uuid references public.listings(id),business_id uuid references public.business_profiles(id),moderator_id uuid references public.profiles(id),action text not null,reason text not null check(length(reason) between 3 and 2000),created_at timestamptz not null default now());
create table public.listing_checks(id uuid primary key default gen_random_uuid(),listing_id uuid references public.listings(id) on delete cascade,flags text[] not null default '{}',created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,kind text not null,listing_id uuid references public.listings(id),created_at timestamptz not null default now());
create table public.promotions(id uuid primary key default gen_random_uuid(),listing_id uuid not null references public.listings(id),user_id uuid not null references public.profiles(id),kind text not null check(kind in ('featured','boosted','sponsored')),starts_at timestamptz,expires_at timestamptz,status text not null default 'disabled' check(status in ('disabled','pending_payment','active','expired')),created_at timestamptz not null default now(),check(status<>'active' or (starts_at is not null and expires_at>starts_at)));
create table public.payments(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),promotion_id uuid references public.promotions(id),provider_event_id text unique,amount numeric not null check(amount>=0),currency text not null default 'USD',status text not null default 'pending' check(status in ('pending','paid','failed','refunded')),created_at timestamptz not null default now());
create table public.audit_logs(id bigint generated always as identity primary key,actor_id uuid,entity text not null,record_id text,operation text not null,created_at timestamptz not null default now());
create table public.site_settings(key text primary key,value jsonb not null,updated_at timestamptz not null default now());
insert into public.site_settings values('posting', '{"daily_submissions":10,"review_required":true,"expiry_days":30}',now()),('promotions','{"enabled":false}',now());
create table private.rate_events(user_id uuid not null,action text not null,created_at timestamptz not null default now());
create index rate_events_idx on private.rate_events(user_id,action,created_at);
create function private.rate_limit(action_name text,max_count int,window_size interval) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||action_name,0));
 if (select count(*) from private.rate_events where user_id=auth.uid() and action=action_name and created_at>now()-window_size)>=max_count then raise exception 'Rate limit exceeded';end if;
 insert into private.rate_events values(auth.uid(),action_name,now());
end$$;
create function private.is_public_listing(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.listings l join public.profiles p on p.id=l.user_id join public.categories c on c.id=l.category_id join public.locations a on a.id=l.location_id where l.id=target and l.status='approved' and l.published_at<=now() and l.expires_at>now() and not p.posting_restricted and c.enabled and a.enabled)$$;
create function private.owns_listing(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.listings where id=target and user_id=auth.uid())$$;
create function private.can_edit_media(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.listings where id=target and user_id=auth.uid() and status='draft') and private.can_post()$$;
create function private.is_participant(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.conversations where id=target and auth.uid() in (requester_id,publisher_id))$$;
-- Provision only an ordinary profile at signup. No client-writable role assignment.
create function private.on_signup() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id,display_name) values(new.id,left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'),''),'Community member'),80));return new;end$$;
create trigger on_auth_signup after insert on auth.users for each row execute function private.on_signup();
create function private.guard_profile() returns trigger language plpgsql set search_path='' as $$begin if not private.is_admin() and (new.id<>old.id or new.posting_restricted is distinct from old.posting_restricted or new.created_at<>old.created_at) then raise exception 'Protected profile fields';end if;return new;end$$;
create trigger guard_profile before update on public.profiles for each row execute function private.guard_profile();
-- Enforce publication boundaries even when a user bypasses the website and calls the database directly.
create function private.guard_listing() returns trigger language plpgsql security definer set search_path='' as $$declare d jsonb:=new.details;begin
 if auth.uid() is not null and not private.is_admin() then
 if new.user_id<>auth.uid() or not private.can_post() then raise exception 'Owner access required';end if;
 if tg_op='UPDATE' and (new.id<>old.id or new.user_id<>old.user_id or new.created_at<>old.created_at) then raise exception 'Immutable identity';end if;
 if new.status not in ('draft','pending','archived') then raise exception 'Moderator approval required';end if;
 new.published_at:=null;new.expires_at:=null;
 if tg_op='INSERT' then perform private.rate_limit('draft',30,interval '1 day');end if;
 if new.status='pending' and (tg_op='INSERT' or old.status<>'pending') then
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Email verification required';end if;
 perform private.rate_limit('submit',least(20,greatest(1,coalesce((select (value->>'daily_submissions')::int from public.site_settings where key='posting'),10))),interval '1 day');
 end if;end if;
 if new.status in ('draft','archived') then new.updated_at:=now();return new;end if;
 if length(new.title)<8 or length(new.description)<40 then raise exception 'Complete title and description required';end if;
 if jsonb_typeof(d)<>'object' or length(d::text)>10000 then raise exception 'Invalid category details';end if;
 if new.category_id='housing' then
 if new.price is null or not(d ?& array['tenure','property_type','bedrooms','bathrooms','furnished','availability','fee_disclosure','broker_fee_payer']) then raise exception 'Housing fields required';end if;
 elsif new.category_id='jobs' then
 if not(d ?& array['company','salary_min','salary_max','pay_period','employment','workplace','industry']) then raise exception 'Job fields required';end if;
 new.price:=(d->>'salary_min')::numeric;
 elsif new.category_id='marketplace' then
 if new.price is null or d->>'condition' not in ('new','like-new','good','fair') or coalesce(length(d->>'pickup'),0)<2 then raise exception 'Marketplace fields required';end if;
 elsif new.category_id='services' then
 if d->>'provider_type' not in ('individual','business') or d->>'price_type' not in ('fixed','hourly','quote') or coalesce(length(d->>'service_area'),0)<2 then raise exception 'Service fields required';end if;
 elsif new.category_id='businesses' then
 if coalesce(length(d->>'business_name'),0)<2 or coalesce(length(d->>'service_type'),0)<2 then raise exception 'Business fields required';end if;
 elsif new.category_id='community' then
 if coalesce(length(d->>'topic'),0)<2 then raise exception 'Community topic required';end if;
 end if;
 new.fingerprint:=md5(regexp_replace(lower(new.title||new.description),'[[:space:][:punct:]]','','g'));
 if new.status='pending' and exists(select 1 from public.listings x where x.id<>new.id and x.user_id=new.user_id and x.fingerprint=new.fingerprint and x.status in ('pending','approved') and x.created_at>now()-interval '30 days') then raise exception 'Duplicate listing';end if;
 new.updated_at:=now();return new;end$$;
create trigger guard_listing before insert or update on public.listings for each row execute function private.guard_listing();
create function private.sync_details() returns trigger language plpgsql security definer set search_path='' as $$declare d jsonb:=new.details;begin
 delete from public.housing_details where listing_id=new.id;delete from public.job_details where listing_id=new.id;
 if new.status in ('draft','archived') then return new;end if;
 if new.category_id='housing' then insert into public.housing_details values(new.id,d->>'tenure',d->>'property_type',(d->>'bedrooms')::int,(d->>'bathrooms')::numeric,d->>'furnished',(d->>'availability')::date,d->>'fee_disclosure',d->>'broker_fee_payer');
 elsif new.category_id='jobs' then insert into public.job_details values(new.id,d->>'company',(d->>'salary_min')::numeric,(d->>'salary_max')::numeric,d->>'pay_period',d->>'employment',d->>'workplace',d->>'industry');end if;
 return new;end$$;
create trigger sync_listing_details after insert or update on public.listings for each row execute function private.sync_details();
create function private.guard_business() returns trigger language plpgsql set search_path='' as $$begin if not private.is_admin() then if new.user_id<>auth.uid() or not private.can_post() or new.status<>'pending' then raise exception 'Business review required';end if;if tg_op='UPDATE' and (new.id<>old.id or new.user_id<>old.user_id or new.created_at<>old.created_at) then raise exception 'Immutable identity';end if;end if;new.updated_at:=now();return new;end$$;
create trigger guard_business before insert or update on public.business_profiles for each row execute function private.guard_business();
create function private.audit() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.audit_logs(actor_id,entity,record_id,operation) values(auth.uid(),tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id'),tg_op);return coalesce(new,old);end$$;
create trigger audit_listing after insert or update or delete on public.listings for each row execute function private.audit();
create trigger audit_profiles after update on public.profiles for each row execute function private.audit();
create trigger audit_business after insert or update or delete on public.business_profiles for each row execute function private.audit();
create function private.guard_message() returns trigger language plpgsql security definer set search_path='' as $$begin if new.sender_id<>auth.uid() or not private.is_participant(new.conversation_id) or not private.can_post() then raise exception 'Participant access required';end if;perform private.rate_limit('message',30,interval '1 hour');return new;end$$;
create trigger guard_message before insert on public.messages for each row execute function private.guard_message();
create function private.guard_report() returns trigger language plpgsql security definer set search_path='' as $$begin if auth.uid() is not null and not private.is_admin() then if new.user_id<>auth.uid() or new.status<>'open' or new.resolution is not null then raise exception 'Invalid report';end if;perform private.rate_limit('report',10,interval '1 day');end if;return new;end$$;
create trigger guard_report before insert on public.reports for each row execute function private.guard_report();
-- Every table is private-by-default; add narrow policies below.
do $$declare t text;begin foreach t in array array['profiles','user_roles','categories','subcategories','locations','listings','housing_details','job_details','listing_media','favorites','business_profiles','conversations','messages','reports','moderation_actions','listing_checks','notifications','promotions','payments','audit_logs','site_settings'] loop execute format('alter table public.%I enable row level security',t);end loop;end$$;
create policy own_role on public.user_roles for select to authenticated using(user_id=auth.uid());
create policy public_profiles on public.profiles for select to anon,authenticated using(id=auth.uid() or private.is_admin() or exists(select 1 from public.listings l where l.user_id=profiles.id and private.is_public_listing(l.id)));
create policy own_profile on public.profiles for update to authenticated using(id=auth.uid() or private.is_admin()) with check(id=auth.uid() or private.is_admin());
create policy public_categories on public.categories for select to anon,authenticated using(enabled or private.is_admin());
create policy admin_categories on public.categories for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy public_subcategories on public.subcategories for select to anon,authenticated using(true);
create policy admin_subcategories on public.subcategories for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy public_locations on public.locations for select to anon,authenticated using(enabled or private.is_admin());
create policy admin_locations on public.locations for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy visible_listings on public.listings for select to anon,authenticated using(private.is_public_listing(id) or user_id=auth.uid() or private.is_admin());
create policy own_listings_insert on public.listings for insert to authenticated with check(user_id=auth.uid() and private.can_post());
create policy own_listings_update on public.listings for update to authenticated using(user_id=auth.uid() or private.is_admin()) with check(user_id=auth.uid() or private.is_admin());
do $$declare t text;begin foreach t in array array['housing_details','job_details'] loop execute format('create policy visible_details on public.%I for select to anon,authenticated using(private.is_public_listing(listing_id) or private.owns_listing(listing_id) or private.is_admin())',t);end loop;end$$;
create policy visible_media on public.listing_media for select to anon,authenticated using(private.is_public_listing(listing_id) or private.owns_listing(listing_id) or private.is_admin());
create policy insert_media on public.listing_media for insert to authenticated with check(private.can_edit_media(listing_id) and split_part(object_path,'/',1)=auth.uid()::text and split_part(object_path,'/',2)=listing_id::text);
create policy update_media on public.listing_media for update to authenticated using(private.can_edit_media(listing_id)) with check(private.can_edit_media(listing_id) and split_part(object_path,'/',1)=auth.uid()::text and split_part(object_path,'/',2)=listing_id::text);
create policy delete_media on public.listing_media for delete to authenticated using(private.can_edit_media(listing_id));
create policy own_favorites on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and private.is_public_listing(listing_id));
create policy visible_business on public.business_profiles for select to anon,authenticated using(status='approved' or user_id=auth.uid() or private.is_admin());
create policy insert_business on public.business_profiles for insert to authenticated with check(user_id=auth.uid() and private.can_post());
create policy update_business on public.business_profiles for update to authenticated using(user_id=auth.uid() or private.is_admin()) with check(user_id=auth.uid() or private.is_admin());
create policy participant_conversations on public.conversations for select to authenticated using(auth.uid() in (requester_id,publisher_id));
create policy participant_messages on public.messages for select to authenticated using(private.is_participant(conversation_id));
create policy participant_insert_messages on public.messages for insert to authenticated with check(sender_id=auth.uid() and private.is_participant(conversation_id));
create policy report_read on public.reports for select to authenticated using(user_id=auth.uid() or private.is_admin());
create policy report_insert on public.reports for insert to authenticated with check(user_id=auth.uid() and private.is_public_listing(listing_id));
create policy report_admin on public.reports for update to authenticated using(private.is_admin()) with check(private.is_admin());
create policy moderation_read on public.moderation_actions for select to authenticated using(private.is_admin() or private.owns_listing(listing_id));
create policy checks_read on public.listing_checks for select to authenticated using(private.is_admin() or private.owns_listing(listing_id));
create policy checks_insert on public.listing_checks for insert to authenticated with check(private.owns_listing(listing_id));
create policy notifications_read on public.notifications for select to authenticated using(user_id=auth.uid());
create policy own_payments on public.payments for select to authenticated using(user_id=auth.uid() or private.is_admin());
create policy own_promotions on public.promotions for select to authenticated using(user_id=auth.uid() or private.is_admin());
create policy audit_admin on public.audit_logs for select to authenticated using(private.is_admin());
create policy settings_admin on public.site_settings for select to authenticated using(private.is_admin());
-- No client writes to payment/promotion/order/event tables, role membership, audit logs or notifications.
revoke all on all tables in schema public from anon,authenticated;
grant select on public.categories,public.subcategories,public.locations,public.listings,public.housing_details,public.job_details,public.listing_media,public.business_profiles to anon,authenticated;
grant select(id,display_name,bio,created_at) on public.profiles to anon;
grant select,update on public.profiles to authenticated;
grant select on public.user_roles,public.conversations,public.messages,public.reports,public.moderation_actions,public.listing_checks,public.notifications,public.promotions,public.payments,public.audit_logs,public.site_settings to authenticated;
grant insert,update on public.listings,public.business_profiles to authenticated;
grant insert,update,delete on public.categories,public.subcategories,public.locations,public.listing_media to authenticated;
grant select,insert,delete on public.favorites to authenticated;
grant insert on public.messages,public.reports,public.listing_checks to authenticated;
grant update on public.reports to authenticated;
-- Trusted RPCs never accept owner IDs or administrator roles from callers.
create function public.contact_publisher(p_listing uuid,p_body text) returns uuid language plpgsql security definer set search_path='' as $$declare owner_id uuid;cid uuid;begin
 if auth.uid() is null or not private.can_post() then raise exception 'Authentication required';end if;
 if not private.is_public_listing(p_listing) then raise exception 'Listing unavailable';end if;
 select user_id into owner_id from public.listings where id=p_listing;
 if owner_id=auth.uid() then raise exception 'Cannot contact yourself';end if;
 insert into public.conversations(listing_id,requester_id,publisher_id) values(p_listing,auth.uid(),owner_id) on conflict(listing_id,requester_id) do update set listing_id=excluded.listing_id returning id into cid;
 insert into public.messages(conversation_id,sender_id,body) values(cid,auth.uid(),p_body);
 insert into public.notifications(user_id,kind,listing_id) values(owner_id,'contact_request',p_listing);return cid;
end$$;
create function public.moderate_listing(p_id uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare target public.listings;expiry int;begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 if p_decision not in ('approved','rejected','archived','pending') or length(btrim(p_reason)) not between 3 and 2000 then raise exception 'Invalid moderation decision';end if;
 select * into target from public.listings where id=p_id for update;if not found then raise exception 'Listing missing';end if;
 if p_decision='approved' and not exists(select 1 from public.profiles where id=target.user_id and not posting_restricted) then raise exception 'Publisher restricted';end if;
 expiry:=least(90,greatest(1,coalesce((select (value->>'expiry_days')::int from public.site_settings where key='posting'),30)));
 update public.listings set status=p_decision,published_at=case when p_decision='approved' then now() else null end,expires_at=case when p_decision='approved' then now()+make_interval(days=>expiry) else null end where id=p_id;
 insert into public.moderation_actions(listing_id,moderator_id,action,reason) values(p_id,auth.uid(),p_decision,p_reason);
 insert into public.notifications(user_id,kind,listing_id) values(target.user_id,p_decision,p_id);
end$$;
create function public.search_listings(p_category text default null,p_filters jsonb default '{}',p_limit int default 12,p_offset int default 0) returns jsonb language sql stable set search_path='' as $$
 with matches as (select l.* from public.listings l where l.status='approved' and private.is_public_listing(l.id)
 and (p_category is null or l.category_id=p_category)
 and (coalesce(p_filters->>'q','')='' or strpos(lower(l.title||' '||l.description),lower(left(p_filters->>'q',150)))>0)
 and (coalesce(p_filters->>'location','')='' or (p_filters->>'location'='nyc' and exists(select 1 from public.locations area where area.id=l.location_id and area.city='New York')) or l.location_id=p_filters->>'location')
 and (coalesce(p_filters->>'subcategory','')='' or l.subcategory=p_filters->>'subcategory')
 and (coalesce(p_filters->>'min','') !~ '^\d+(\.\d+)?$' or l.price>=(p_filters->>'min')::numeric)
 and (coalesce(p_filters->>'max','') !~ '^\d+(\.\d+)?$' or l.price<=(p_filters->>'max')::numeric)
 and (coalesce(p_filters->>'free','')<>'1' or l.price=0)
 and not exists(select 1 from jsonb_each_text(p_filters) f where f.key in ('tenure','property_type','furnished','employment','workplace','pay_period','condition','provider_type','price_type') and f.value<>'' and coalesce(l.details->>f.key,'')<>f.value)
 and not exists(select 1 from jsonb_each_text(p_filters) f where f.key in ('nearby','industry','service_area','service_type','topic') and f.value<>'' and strpos(lower(coalesce(l.details->>f.key,'')),lower(f.value))=0)
 and (coalesce(p_filters->>'bedrooms','') !~ '^\d+$' or (l.details->>'bedrooms')::numeric>=(p_filters->>'bedrooms')::numeric)
 and (coalesce(p_filters->>'bathrooms','') !~ '^\d+(\.\d+)?$' or (l.details->>'bathrooms')::numeric>=(p_filters->>'bathrooms')::numeric)
 and (coalesce(p_filters->>'availability','')='' or l.details->>'availability'<=p_filters->>'availability')
 and (coalesce(p_filters->>'event_date','')='' or l.details->>'event_date'=p_filters->>'event_date')),
 paged as (select * from matches order by case when p_filters->>'sort'='price-low' then price end asc nulls last,case when p_filters->>'sort'='price-high' then price end desc nulls last,published_at desc,id limit least(24,greatest(1,p_limit)) offset least(12000,greatest(0,p_offset)))
 select jsonb_build_object('total',(select count(*) from matches),'items',coalesce((select jsonb_agg(to_jsonb(p)) from paged p),'[]'::jsonb));$$;
create function public.expire_content() returns int language plpgsql security definer set search_path='' as $$declare affected int;begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Service role required';end if;
 update public.listings set status='expired' where status='approved' and expires_at<=now();get diagnostics affected=row_count;
 update public.promotions set status='expired' where status='active' and expires_at<=now();
 delete from private.rate_events where created_at<now()-interval '7 days';return affected;
end$$;
-- Lock down function execution, including definer helpers.
revoke all on all functions in schema private from public;
grant execute on function private.is_admin(),private.can_post(),private.is_public_listing(uuid),private.owns_listing(uuid),private.can_edit_media(uuid),private.is_participant(uuid) to anon,authenticated;
revoke all on function public.contact_publisher(uuid,text),public.moderate_listing(uuid,text,text),public.expire_content() from public;
grant execute on function public.contact_publisher(uuid,text),public.moderate_listing(uuid,text,text) to authenticated;
grant execute on function public.expire_content() to service_role;
revoke all on function public.search_listings(text,jsonb,int,int) from public;
grant execute on function public.search_listings(text,jsonb,int,int) to anon,authenticated;
-- Private storage: owners see their draft media; only approved/current listing images can be signed for public delivery.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('listing-images','listing-images',false,4194304,array['image/jpeg','image/png','image/webp']);
create policy listing_image_read on storage.objects for select to anon,authenticated using(bucket_id='listing-images' and exists(select 1 from public.listing_media m where m.object_path=name and (private.is_public_listing(m.listing_id) or private.owns_listing(m.listing_id))));
create policy listing_image_insert on storage.objects for insert to authenticated with check(bucket_id='listing-images' and split_part(name,'/',1)=auth.uid()::text and exists(select 1 from public.listings l where l.id::text=split_part(name,'/',2) and private.can_edit_media(l.id)));
create policy listing_image_delete on storage.objects for delete to authenticated using(bucket_id='listing-images' and split_part(name,'/',1)=auth.uid()::text and exists(select 1 from public.listings l where l.id::text=split_part(name,'/',2) and private.can_edit_media(l.id)));
commit;
