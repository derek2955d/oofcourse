-- Incremental upgrade. Apply after 001 in an isolated development project.
begin;
alter table public.admin_users add column role text not null default 'admin' check(role in ('admin','editor'));
create or replace function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admin_users where user_id=(select auth.uid()) and role='admin'); $$;
create table public.retailers (
 id uuid primary key default gen_random_uuid(), name text not null,
 slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 homepage_url text not null check(homepage_url ~ '^https://'),
 allowed_hosts text[] not null default '{}',
 enabled boolean not null default false,
 affiliate_approved boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.retailers enable row level security;
create policy "Public approved retailers" on public.retailers for select to anon,authenticated using(enabled and affiliate_approved);
create policy "Admin retailers" on public.retailers for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
grant select on public.retailers to anon;
grant select,insert,update,delete on public.retailers to authenticated;

alter table public.deal_sources add column retailer_id uuid references public.retailers(id) on delete restrict;
alter table public.deal_sources add constraint source_retailer_unique unique(id,retailer_id);
alter table public.products add column retailer_id uuid references public.retailers(id) on delete restrict;
alter table public.products add column price_verified boolean not null default false;
alter table public.products add column price_usage_authorized boolean not null default false;
alter table public.products add constraint product_retailer_unique unique(id,retailer_id);
alter table public.products add constraint product_source_same_retailer foreign key(source_id,retailer_id) references public.deal_sources(id,retailer_id);
-- Remove the legacy active status checks without depending on generated constraint names.
drop policy "Public verified unexpired live offers" on public.products;
drop index public.products_expiration_idx;
do $$declare item record; begin for item in select conname from pg_constraint where conrelid='public.products'::regclass and contype='c' and pg_get_constraintdef(oid) like '%status%' loop execute format('alter table public.products drop constraint %I',item.conname); end loop; end$$;
-- Legacy offers require retailer/source review before being republished.
update public.products set status='unverified' where status='active';
alter table public.products add constraint product_status_values check(status in ('draft','pending_review','published','unverified','expired','archived'));
alter table public.products add constraint published_provenance check(status<>'published' or (not is_demo and retailer_id is not null and source_id is not null and image_license is not null and last_checked_at is not null and expires_at is not null));
alter table public.products add constraint price_permission_required check(current_price is null or is_demo or (price_verified and price_usage_authorized));
create index products_expiration_idx on public.products(expires_at) where status='published';

create table public.affiliate_links (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null,
 retailer_id uuid not null references public.retailers(id) on delete restrict,
 source_id uuid not null,
 url text not null check(url ~ '^https://'),
 approved boolean not null default false,
 enabled boolean not null default false,
 checked_at timestamptz,
 expires_at timestamptz,
 created_at timestamptz not null default now(),
 foreign key(product_id,retailer_id) references public.products(id,retailer_id) on delete cascade,
 foreign key(source_id,retailer_id) references public.deal_sources(id,retailer_id) on delete restrict
);
create index affiliate_links_product_idx on public.affiliate_links(product_id,retailer_id);
create index affiliate_links_source_idx on public.affiliate_links(source_id);
alter table public.affiliate_links enable row level security;
create policy "Admin links" on public.affiliate_links for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
grant select on public.affiliate_links to anon;
grant select,insert,update,delete on public.affiliate_links to authenticated;

-- Only registered exact merchant hosts, never arbitrary redirects or cross-retailer reuse.
create function private.enforce_affiliate_destination() returns trigger language plpgsql security definer set search_path='' as $$
declare host text; allowed text[];
begin
 host=lower(substring(new.url from '^https://([^/?#]+)'));
 select allowed_hosts into allowed from public.retailers where id=new.retailer_id;
 if host is null or host ~ '[@:]' or not(host=any(allowed)) then raise exception 'Affiliate destination must match approved retailer host'; end if;
 return new;
end;$$;
revoke all on function private.enforce_affiliate_destination() from public;
create trigger affiliate_destination before insert or update on public.affiliate_links for each row execute function private.enforce_affiliate_destination();

-- Definer helper prevents recursive RLS while enforcing source/link provenance on reads.
create function private.has_publishable_offer(product_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.products p
 join public.retailers r on r.id=p.retailer_id
 join public.deal_sources s on s.id=p.source_id and s.retailer_id=p.retailer_id
 join public.affiliate_links a on a.product_id=p.id and a.retailer_id=p.retailer_id and a.source_id=p.source_id
 where p.id=product_uuid and p.status='published' and not p.is_demo
 and p.expires_at>now() and p.last_checked_at<=now() and p.last_checked_at>now()-interval '24 hours'
 and r.enabled and r.affiliate_approved and s.enabled and s.affiliate_approved
 and a.enabled and a.approved and a.expires_at>now() and a.checked_at<=now() and a.checked_at>now()-interval '24 hours'
 and lower(substring(a.url from '^https://([^/?#]+)'))=any(r.allowed_hosts));
$$;
grant usage on schema private to anon;
revoke all on function private.has_publishable_offer(uuid) from public;
grant execute on function private.has_publishable_offer(uuid) to anon,authenticated;
create policy "Public current published offers" on public.products for select to anon,authenticated using(private.has_publishable_offer(id));
create function private.is_public_affiliate_link(link_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.affiliate_links a
 join public.products p on p.id=a.product_id and p.retailer_id=a.retailer_id and p.source_id=a.source_id
 join public.retailers r on r.id=a.retailer_id
 join public.deal_sources s on s.id=a.source_id and s.retailer_id=a.retailer_id
 where a.id=link_uuid and p.status='published' and not p.is_demo
 and p.expires_at>now() and p.last_checked_at<=now() and p.last_checked_at>now()-interval '24 hours'
 and r.enabled and r.affiliate_approved and s.enabled and s.affiliate_approved
 and a.enabled and a.approved and a.expires_at>now() and a.checked_at<=now() and a.checked_at>now()-interval '24 hours'
 and lower(substring(a.url from '^https://([^/?#]+)'))=any(r.allowed_hosts));
$$;
revoke all on function private.is_public_affiliate_link(uuid) from public;
grant execute on function private.is_public_affiliate_link(uuid) to anon,authenticated;
create policy "Public current affiliate links" on public.affiliate_links for select to anon,authenticated using(private.is_public_affiliate_link(id));

-- Operational audit data is private; public clients never insert fabricated clicks.
create table public.analytics_events (
 id uuid primary key default gen_random_uuid(),
 event_type text not null check(event_type in ('page_view','search','product_view','merchant_click','save','category_view')),
 product_id uuid references public.products(id) on delete set null,
 retailer_id uuid references public.retailers(id) on delete set null,
 category_id uuid references public.categories(id) on delete set null,
 path text,
 -- Do not store IPs, emails, raw search terms or stable visitor IDs.
 created_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create policy "Admin analytics read" on public.analytics_events for select to authenticated using((select private.is_admin()));
grant select on public.analytics_events to authenticated;
create index analytics_event_time_idx on public.analytics_events(event_type,created_at desc);
create table public.admin_audit_log (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id) on delete set null,
 entity text not null, entity_id uuid, operation text not null,
 created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create policy "Admin audit read" on public.admin_audit_log for select to authenticated using((select private.is_admin()));
grant select on public.admin_audit_log to authenticated;
create function private.audit_admin_write() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.admin_audit_log(actor_id,entity,entity_id,operation) values(auth.uid(),tg_table_name,case when tg_op='DELETE' then old.id else new.id end,tg_op);return coalesce(new,old);end;$$;
revoke all on function private.audit_admin_write() from public;
create trigger audit_products after insert or update or delete on public.products for each row execute function private.audit_admin_write();
create trigger audit_links after insert or update or delete on public.affiliate_links for each row execute function private.audit_admin_write();
create trigger audit_retailers after insert or update or delete on public.retailers for each row execute function private.audit_admin_write();
commit;
