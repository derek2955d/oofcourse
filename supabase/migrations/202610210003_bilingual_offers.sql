-- Generic product identity + independent, source-scoped retailer offers.
-- Apply after 001 and 002 in an isolated development project, not another site.
begin;
alter table public.products alter column merchant drop not null;
alter table public.products add column name_zh text not null default '';
alter table public.products add column description_zh text not null default '';
alter table public.categories add column name_zh text not null default '';
alter table public.products add column content_scope text not null default 'neutral' check(content_scope in ('neutral','retailer_restricted'));
alter table public.products add column content_retailer_id uuid references public.retailers(id) on delete restrict;
-- Conservatively scope legacy licensed merchant content to its original retailer.
update public.products set content_scope='retailer_restricted',content_retailer_id=retailer_id where not is_demo and retailer_id is not null;
alter table public.products add constraint product_content_provenance check((content_scope='neutral' and content_retailer_id is null) or (content_scope='retailer_restricted' and content_retailer_id is not null));
alter table public.products drop constraint published_provenance;
alter table public.products add constraint published_product_license check(status<>'published' or (not is_demo and image_license is not null));
comment on column public.products.name is 'English product identity; name_zh is the optional Chinese translation. Facts are shared.';
comment on column public.products.retailer_id is 'Legacy primary-retailer reference. New multi-retailer facts belong to offers.';
comment on column public.products.current_price is 'Legacy field; new prices and permissions belong to offers.';
create index products_bilingual_search_idx on public.products using gin(to_tsvector('simple',coalesce(name,'')||' '||coalesce(name_zh,'')||' '||coalesce(description,'')||' '||coalesce(description_zh,'')));
-- Chinese substring/trigram search remains available without assuming word spaces.
create extension if not exists pg_trgm;
create index product_name_zh_trgm_idx on public.products using gin(name_zh gin_trgm_ops);

create table public.offers (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 retailer_id uuid not null references public.retailers(id) on delete restrict,
 source_id uuid not null,
 status text not null default 'draft' check(status in ('draft','pending_review','published','unverified','expired','archived')),
 is_demo boolean not null default true,
 currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'),
 current_price numeric(12,2) check(current_price>=0 and current_price<10000000000),
 original_price numeric(12,2) check(original_price>=0 and original_price<10000000000),
 price_verified boolean not null default false,
 price_usage_authorized boolean not null default false,
 discount_percentage numeric(5,2) generated always as (case when original_price>0 and current_price is not null and price_verified and price_usage_authorized then round((1-current_price/original_price)*100,2) else null end) stored,
 image_url text check(image_url is null or image_url ~ '^https://' or image_url like '/illustrations/%'),
 image_license text,
 content_scope text not null default 'retailer_restricted' check(content_scope in ('neutral','retailer_restricted')),
 content_retailer_id uuid references public.retailers(id) on delete restrict,
 last_checked_at timestamptz,
 expires_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,product_id,retailer_id,source_id),
 foreign key(source_id,retailer_id) references public.deal_sources(id,retailer_id) on delete restrict,
 check(original_price is null or current_price is null or original_price>=current_price),
 check((current_price is null and original_price is null) or (price_verified and price_usage_authorized)),
 check((content_scope='neutral' and content_retailer_id is null) or (content_scope='retailer_restricted' and content_retailer_id is not null and content_retailer_id=retailer_id)),
 check(status<>'published' or (not is_demo and image_license is not null and last_checked_at is not null and expires_at is not null))
);
create index offers_product_idx on public.offers(product_id,status);
create index offers_retailer_idx on public.offers(retailer_id,source_id);
create index offers_expiration_idx on public.offers(expires_at) where status='published';
alter table public.offers enable row level security;
create policy "Admin offers" on public.offers for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
grant select on public.offers to anon;
grant select,insert,update,delete on public.offers to authenticated;
create trigger offers_updated_at before update on public.offers for each row execute function private.touch_updated_at();
create trigger audit_offers after insert or update or delete on public.offers for each row execute function private.audit_admin_write();
-- Retain facts from the previous model; never manufacture new retailer data.
insert into public.offers(product_id,retailer_id,source_id,status,is_demo,currency,current_price,original_price,price_verified,price_usage_authorized,image_url,image_license,content_scope,content_retailer_id,last_checked_at,expires_at)
select id,retailer_id,source_id,status,is_demo,currency,case when not is_demo and price_verified and price_usage_authorized then current_price else null end,case when not is_demo and price_verified and price_usage_authorized then original_price else null end,price_verified,price_usage_authorized,image_url,image_license,'retailer_restricted',retailer_id,last_checked_at,expires_at from public.products where retailer_id is not null and source_id is not null;
-- Preserve unmatched legacy links as private draft offers for manual review.
insert into public.offers(product_id,retailer_id,source_id,status,is_demo,content_scope)
select distinct a.product_id,a.retailer_id,a.source_id,'draft',true,'neutral'
from public.affiliate_links a where not exists(select 1 from public.offers o where o.product_id=a.product_id and o.retailer_id=a.retailer_id and o.source_id=a.source_id);
alter table public.affiliate_links add column offer_id uuid;
update public.affiliate_links a set offer_id=o.id from public.offers o where o.product_id=a.product_id and o.retailer_id=a.retailer_id and o.source_id=a.source_id;
alter table public.affiliate_links alter column offer_id set not null;
-- Remove the legacy one-product/one-retailer restriction. The new FK pins each
-- affiliate URL to its exact offer, retailer AND source.
alter table public.affiliate_links drop constraint affiliate_links_product_id_retailer_id_fkey;
alter table public.affiliate_links add constraint affiliate_offer_provenance foreign key(offer_id,product_id,retailer_id,source_id) references public.offers(id,product_id,retailer_id,source_id) on delete cascade;
create index affiliate_links_offer_idx on public.affiliate_links(offer_id);
alter table public.deal_checks add column offer_id uuid references public.offers(id) on delete set null;
create index deal_checks_offer_idx on public.deal_checks(offer_id,checked_at desc);
alter table public.analytics_events add column offer_id uuid references public.offers(id) on delete set null;

create function private.offer_is_public(offer_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.offers o
 join public.products p on p.id=o.product_id
 join public.retailers r on r.id=o.retailer_id
 join public.deal_sources s on s.id=o.source_id and s.retailer_id=o.retailer_id
 where o.id=offer_uuid and o.status='published' and not o.is_demo and p.status='published' and not p.is_demo
 and p.image_license is not null and (p.content_scope='neutral' or p.content_retailer_id=o.retailer_id)
 and o.image_license is not null and (o.content_scope='neutral' or o.content_retailer_id=o.retailer_id)
 and o.last_checked_at<=now() and o.last_checked_at>now()-interval '24 hours' and o.expires_at>now()
 and r.enabled and r.affiliate_approved and s.enabled and s.affiliate_approved
 and exists(select 1 from public.affiliate_links a where a.offer_id=o.id and a.product_id=o.product_id and a.retailer_id=o.retailer_id and a.source_id=o.source_id
 and a.enabled and a.approved and a.checked_at<=now() and a.checked_at>now()-interval '24 hours' and a.expires_at>now()
 and lower(substring(a.url from '^https://([^/?#]+)'))=any(r.allowed_hosts)));
$$;
revoke all on function private.offer_is_public(uuid) from public;
grant execute on function private.offer_is_public(uuid) to anon,authenticated;
create or replace function private.has_publishable_offer(product_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.offers o where o.product_id=product_uuid and private.offer_is_public(o.id)); $$;
create or replace function private.is_public_affiliate_link(link_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.affiliate_links a join public.retailers r on r.id=a.retailer_id where a.id=link_uuid and private.offer_is_public(a.offer_id)
 and a.enabled and a.approved and a.checked_at<=now() and a.checked_at>now()-interval '24 hours' and a.expires_at>now()
 and lower(substring(a.url from '^https://([^/?#]+)'))=any(r.allowed_hosts));
$$;
create policy "Public verified offers" on public.offers for select to anon,authenticated using(private.offer_is_public(id));
commit;
