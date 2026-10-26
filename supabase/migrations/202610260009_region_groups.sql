-- Add grouped NJ browsing with filtering before ordering, counting and pagination.
-- Existing state search and tables remain unchanged.
begin;
create or replace function public.search_listings_by_region(p_category text default null,p_filters jsonb default '{}',p_limit int default 12,p_offset int default 0) returns jsonb language sql stable set search_path='' as $$
 with matches as (select l.*, a.state from public.listings l join public.locations a on a.id=l.location_id where l.status='approved' and private.is_public_listing(l.id)
 and a.state=upper(coalesce(nullif(p_filters->>'state',''),'NY'))
 and (p_category is null or l.category_id=p_category)
 and (coalesce(p_filters->>'q','')='' or strpos(lower(l.title||' '||l.description),lower(left(p_filters->>'q',150)))>0)
 and (coalesce(p_filters->>'location','')='' or (p_filters->>'location'='nyc' and exists(select 1 from public.locations area where area.id=l.location_id and area.city='New York')) or (p_filters->>'location'='nj-near-manhattan' and a.state='NJ' and a.id in ('jersey-city','hoboken','weehawken','union-city','west-new-york')) or l.location_id=p_filters->>'location')
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
revoke all on function public.search_listings_by_region(text,jsonb,int,int) from public;
grant execute on function public.search_listings_by_region(text,jsonb,int,int) to anon,authenticated;
commit;
