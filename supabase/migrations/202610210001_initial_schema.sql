-- Apply to a NEW Supabase development project only. No live/demo seed is inserted.
begin;
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "Admins can read own membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
-- Membership provisioning uses a privileged server/SQL console, never a public API.
create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create table public.categories (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null,
 description text not null default '',
 created_at timestamptz not null default now()
);
create table public.deal_sources (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 merchant text not null,
 homepage_url text check (homepage_url is null or homepage_url ~ '^https://'),
 source_type text not null check(source_type in ('official_api','approved_feed','manual')),
 enabled boolean not null default false,
 affiliate_approved boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 description text not null,
 category_id uuid not null references public.categories(id) on delete restrict,
 source_id uuid references public.deal_sources(id) on delete restrict,
 merchant text not null,
 merchant_product_id text,
 image_url text check (image_url is null or image_url ~ '^https://' or image_url like '/illustrations/%'),
 image_license text,
 affiliate_url text check (affiliate_url is null or affiliate_url ~ '^https://'),
 currency text not null default 'USD' check(currency = 'USD'),
 current_price numeric(12,2) check(current_price >= 0),
 original_price numeric(12,2) check(original_price >= 0),
 discount_percentage numeric(5,2) generated always as (case when original_price > 0 and current_price is not null then round((1-current_price/original_price)*100,2) else null end) stored,
 status text not null default 'draft' check(status in ('draft','active','expired','unverified')),
 is_demo boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 expires_at timestamptz,
 last_checked_at timestamptz,
 check (original_price is null or current_price is null or original_price >= current_price),
 check (status <> 'active' or (not is_demo and source_id is not null and affiliate_url is not null and image_license is not null and last_checked_at is not null and expires_at is not null))
);
create table public.deal_checks (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 source_id uuid references public.deal_sources(id) on delete set null,
 checked_at timestamptz not null default now(),
 result text not null check(result in ('available','expired','unavailable','error')),
 observed_price numeric(12,2) check(observed_price >= 0),
 -- Store sanitized operational notes only. Never persist tokens or raw API responses.
 notes text
);
create index products_category_status_idx on public.products(category_id,status,created_at desc);
create index products_expiration_idx on public.products(expires_at) where status='active';
create index products_source_idx on public.products(source_id);
create index deal_checks_product_time_idx on public.deal_checks(product_id,checked_at desc);
create index deal_checks_source_idx on public.deal_checks(source_id);
create function private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$begin new.updated_at=now(); return new; end;$$;
create trigger products_updated_at before update on public.products for each row execute function private.touch_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.deal_sources enable row level security;
alter table public.deal_checks enable row level security;
create policy "Public categories" on public.categories for select to anon,authenticated using (true);
create policy "Public verified unexpired live offers" on public.products for select to anon,authenticated using (
 status='active' and not is_demo and expires_at > now() and last_checked_at > now()-interval '24 hours'
 and exists(select 1 from public.deal_sources s where s.id=source_id and s.enabled and s.affiliate_approved)
);
-- Only approved, enabled source records are publicly readable; do not store secrets here.
create policy "Public enabled sources" on public.deal_sources for select to anon,authenticated using (enabled and affiliate_approved);
create policy "Admin categories" on public.categories for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin products" on public.products for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin sources" on public.deal_sources for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin checks" on public.deal_checks for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke all on public.admin_users from anon,authenticated;
grant select on public.admin_users to authenticated;
grant select on public.categories,public.products,public.deal_sources to anon;
grant select,insert,update,delete on public.categories,public.products,public.deal_sources,public.deal_checks to authenticated;
commit;
