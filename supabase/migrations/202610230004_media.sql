begin;
create function public.reorder_media(p_listing uuid,p_ids uuid[]) returns void language plpgsql set search_path='' as $$declare current_ids uuid[];begin
 if not private.can_edit_media(p_listing) then raise exception 'Owner draft access required';end if;
 perform 1 from public.listings where id=p_listing for update;
 select array_agg(id order by id) into current_ids from public.listing_media where listing_id=p_listing;
 if cardinality(p_ids)>8 or (select array_agg(i order by i) from unnest(p_ids)i) is distinct from current_ids then raise exception 'Exact media membership required';end if;
 update public.listing_media m set position=u.ordinality-1 from unnest(p_ids) with ordinality u(id,ordinality) where m.id=u.id and m.listing_id=p_listing;
end$$;
revoke all on function public.reorder_media(uuid,uuid[]) from public;
grant execute on function public.reorder_media(uuid,uuid[]) to authenticated;
create function private.active_user(target uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=target and not posting_restricted)$$;
revoke all on function private.active_user(uuid) from public;
grant execute on function private.active_user(uuid) to anon,authenticated;
drop policy visible_business on public.business_profiles;
create policy visible_business on public.business_profiles for select to anon,authenticated using((status='approved' and private.active_user(user_id)) or user_id=auth.uid() or private.is_admin());
-- Bound private uploads even when a caller uses the Storage API directly.
create function private.upload_capacity(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.can_edit_media(target) and (select count(*) from storage.objects where bucket_id='listing-images' and split_part(name,'/',1)=auth.uid()::text)<100 and (select count(*) from storage.objects where bucket_id='listing-images' and split_part(name,'/',2)=target::text)<8$$;
revoke all on function private.upload_capacity(uuid) from public;
grant execute on function private.upload_capacity(uuid) to authenticated;
drop policy listing_image_insert on storage.objects;
create policy listing_image_insert on storage.objects for insert to authenticated with check(bucket_id='listing-images' and split_part(name,'/',1)=auth.uid()::text and exists(select 1 from public.listings l where l.id::text=split_part(name,'/',2) and private.upload_capacity(l.id)));
commit;
