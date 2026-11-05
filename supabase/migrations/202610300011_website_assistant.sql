begin;
-- Private provenance; public listings retain the existing single-language schema.
create table public.assistant_imports (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.listings(id) on delete cascade,
 actor_id uuid not null references public.profiles(id),
 source_url text not null check(length(source_url)<=1500),
 source_text text not null check(length(source_text) between 80 and 16000),
 event_day date not null,
 translations jsonb not null check(octet_length(translations::text)<=16000),
 created_at timestamptz not null default now(),
 unique(source_url,event_day)
);
alter table public.assistant_imports enable row level security;
create policy assistant_admin_read on public.assistant_imports for select to authenticated using(private.is_admin());
revoke all on public.assistant_imports from anon,authenticated;
grant select on public.assistant_imports to authenticated;
create function public.reserve_assistant_generation() returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'Admin required';end if;
 perform private.rate_limit('assistant-generation',10,interval '1 day');
end$$;
create function public.save_assistant_activity(p_url text,p_source text,p_title text,p_description text,p_day date,p_location text,p_translation jsonb,p_locale text)
returns uuid language plpgsql security definer set search_path='' as $$declare target uuid;begin
 if not private.is_admin() then raise exception 'Admin required';end if;
 if p_url is null or p_url !~ '^https://[^[:space:]]+$' or length(p_url)>1500 or p_source is null or length(p_source) not between 80 and 16000 or p_title is null or length(p_title) not between 8 and 100 or p_description is null or length(p_description) not between 40 and 4500 or length(p_description||E'\n\nSource: '||p_url)>6000 or p_day is null or p_day<(now() at time zone 'America/New_York')::date or p_locale is null or p_locale not in ('en','zh') or p_translation is null or jsonb_typeof(p_translation)<>'object' then raise exception 'Invalid input';end if;
 if not exists(select 1 from public.locations where id=p_location and enabled and (state='NY' or (state='NJ' and id in ('jersey-city','hoboken','weehawken','union-city','west-new-york')))) then raise exception 'Invalid location';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_url||p_day::text,0));
 select listing_id into target from public.assistant_imports where source_url=p_url and event_day=p_day;
 if target is not null then return target;end if;
 perform private.rate_limit('assistant-save',20,interval '1 day');
 insert into public.listings(user_id,category_id,subcategory,location_id,title,description,price,status,details)
 values(auth.uid(),'community','events',p_location,p_title,p_description||E'\n\nSource: '||p_url,null,'draft',jsonb_build_object('topic','Local event','event_date',p_day::text)) returning id into target;
 insert into public.assistant_imports(listing_id,actor_id,source_url,source_text,event_day,translations) values(target,auth.uid(),p_url,p_source,p_day,p_translation);
 insert into public.audit_logs(actor_id,entity,record_id,operation) values(auth.uid(),'assistant_imports',target::text,'CREATE_DRAFT');
 return target;
end$$;
revoke all on function public.reserve_assistant_generation(),public.save_assistant_activity(text,text,text,text,date,text,jsonb,text) from public;
grant execute on function public.reserve_assistant_generation(),public.save_assistant_activity(text,text,text,text,date,text,jsonb,text) to authenticated;
commit;
