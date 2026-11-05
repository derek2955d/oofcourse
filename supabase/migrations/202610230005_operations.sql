begin;
alter table public.business_profiles add column category_id text not null default 'businesses' check(category_id='businesses');
alter table public.business_profiles add constraint business_subcategory foreign key(category_id,category) references public.subcategories(category_id,id);
create table public.user_restrictions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),actor_id uuid not null references public.profiles(id),restricted boolean not null,reason text not null check(length(reason) between 3 and 2000),created_at timestamptz not null default now());
alter table public.user_restrictions enable row level security;
create policy restrictions_read on public.user_restrictions for select to authenticated using(private.is_admin() or user_id=auth.uid());
grant select on public.user_restrictions to authenticated;
create function public.restrict_member(p_id uuid,p_restricted boolean,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() or p_id=auth.uid() then raise exception 'Administrator action required';end if;
 if length(btrim(p_reason)) not between 3 and 2000 then raise exception 'Reason required';end if;
 update public.profiles set posting_restricted=p_restricted where id=p_id;if not found then raise exception 'User missing';end if;
 insert into public.user_restrictions(user_id,actor_id,restricted,reason) values(p_id,auth.uid(),p_restricted,p_reason);
end$$;
create function public.admin_summary() returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 return jsonb_build_object('users',(select count(*) from public.profiles),'active',(select count(*) from public.listings where private.is_public_listing(id)),'pending',(select count(*) from public.listings where status='pending'),'reports',(select count(*) from public.reports where status<>'resolved'),'businesses',(select count(*) from public.business_profiles),'trend',(select jsonb_agg(jsonb_build_object('date',d::date,'count',(select count(*) from public.listings l where l.created_at>=d and l.created_at<d+interval '1 day'))) from generate_series(date_trunc('day',now())-interval '6 days',date_trunc('day',now()),interval '1 day')d));
end$$;
revoke all on function public.restrict_member(uuid,boolean,text),public.admin_summary() from public;
grant execute on function public.restrict_member(uuid,boolean,text),public.admin_summary() to authenticated;
-- Uploading a logo never bypasses business approval or private storage boundaries.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('business-logos','business-logos',false,4194304,array['image/webp','image/jpeg','image/png']);
create function private.owns_business(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.business_profiles b where b.id=target and b.user_id=auth.uid() and b.status='pending')$$;
revoke all on function private.owns_business(uuid) from public;
grant execute on function private.owns_business(uuid) to authenticated;
create policy business_logo_read on storage.objects for select to anon,authenticated using(bucket_id='business-logos' and exists(select 1 from public.business_profiles b where b.logo_path=name and ((b.status='approved' and private.active_user(b.user_id)) or b.user_id=auth.uid())));
create policy business_logo_insert on storage.objects for insert to authenticated with check(bucket_id='business-logos' and split_part(name,'/',1)=auth.uid()::text and exists(select 1 from public.business_profiles b where b.id::text=split_part(name,'/',2) and private.owns_business(b.id)));
create policy business_logo_delete on storage.objects for delete to authenticated using(bucket_id='business-logos' and split_part(name,'/',1)=auth.uid()::text);
create function private.validate_logo() returns trigger language plpgsql set search_path='' as $$begin
 if new.logo_path is not null and (split_part(new.logo_path,'/',1)<>new.user_id::text or split_part(new.logo_path,'/',2)<>new.id::text) then raise exception 'Business logo provenance mismatch';end if;return new;end$$;
create trigger validate_logo before insert or update on public.business_profiles for each row execute function private.validate_logo();
revoke all on function private.validate_logo() from public;
commit;
