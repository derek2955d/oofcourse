-- Reuse owner drafts, private images and audited moderation for outing submissions.
begin;
insert into public.subcategories(category_id,id,name_en,name_zh,sort_order)
 values('community','outings','Weekend outings','周末好去处',8) on conflict(category_id,id) do nothing;
insert into public.locations(id,name_en,name_zh,state,city)
 values('beacon','Beacon, Hudson Valley','Beacon，哈德逊河谷','NY','Beacon') on conflict(id) do nothing;
create or replace function private.validate_extension() returns trigger language plpgsql set search_path='' as $$declare allowed text[];required text[];begin
 if new.status in ('draft','archived') then return new;end if;
 case new.category_id
 when 'housing' then allowed:=array['tenure','property_type','bedrooms','bathrooms','furnished','availability','fee_disclosure','broker_fee_payer','nearby'];required:=allowed[1:8];
 when 'jobs' then allowed:=array['company','salary_min','salary_max','pay_period','employment','workplace','industry','benefits'];required:=allowed[1:7];
 when 'marketplace' then allowed:=array['condition','pickup'];required:=allowed;
 when 'services' then allowed:=array['provider_type','price_type','service_area'];required:=allowed;
 when 'businesses' then allowed:=array['business_name','service_type','website','opening_hours'];required:=allowed[1:2];
 when 'community' then if new.subcategory='outings' then allowed:=array['topic','event_date','outing_type','outing_place','outing_area'];required:=array['topic','outing_type','outing_place','outing_area'];else allowed:=array['topic','event_date'];required:=allowed[1:1];end if;
 else raise exception 'Unknown category';end case;
 if not(new.details ?& required) or exists(select 1 from jsonb_object_keys(new.details) k where k<>all(allowed)) or exists(select 1 from unnest(required) k where new.details->k='null'::jsonb) then raise exception 'Invalid structured fields';end if;
 return new;end$$;

create or replace function private.guard_weekend_outing() returns trigger language plpgsql security definer set search_path='' as $$
declare area public.locations; region text;
begin
 if new.category_id<>'community' then return new;end if;
 if new.subcategory<>'outings' then new.details:=new.details-'outing_area'-'outing_type'-'outing_place';return new;end if;
 select * into area from public.locations where id=new.location_id and enabled;
 region:=case when area.state='NY' and area.city='New York' then 'nyc'
  when area.state='NJ' and area.id in ('jersey-city','hoboken','weehawken','union-city','west-new-york') then 'nj'
  when area.state='NY' and area.id='beacon' and area.city='Beacon' then 'hudson' else null end;
 new.price:=null;
 new.details:=new.details-'outing_area';
 if region is not null then new.details:=new.details||jsonb_build_object('outing_area',region);end if;
 if new.status in ('pending','approved') and (
  region is null or coalesce(new.details->>'outing_type','') not in ('outdoors','waterfront','art','daytrip')
  or jsonb_typeof(new.details->'outing_place') is distinct from 'string'
  or length(btrim(coalesce(new.details->>'outing_place',''))) not between 3 and 500
 ) then raise exception 'Complete supported outing destination and type required';end if;
 return new;
end$$;
revoke all on function private.guard_weekend_outing() from public;
create trigger guard_weekend_outing before insert or update on public.listings for each row execute function private.guard_weekend_outing();
commit;
