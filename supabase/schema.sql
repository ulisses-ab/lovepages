-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Pages table
create table if not exists pages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null default 'My Love Page',
  slug        text unique,                  -- public URL slug, e.g. /p/my-love-page
  blocks      jsonb not null default '[]',  -- array of block objects
  settings    jsonb not null default '{}',  -- page-level options (bgColor, etc.)
  published   boolean not null default false,
  expires_at  timestamptz,                        -- null = never paid; set by Stripe webhook to now()+1yr
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table pages enable row level security;

-- Owners can read/write their own pages
create policy "owners can manage own pages"
  on pages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone can read published pages that haven't expired
create policy "public can read published pages"
  on pages for select
  using (published = true and (expires_at is null or expires_at > now()));

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pages_updated_at
  before update on pages
  for each row execute procedure update_updated_at();

-- Migration: add settings column (skip if creating fresh from this file — column is in the table definition above)
-- alter table pages add column if not exists settings jsonb not null default '{}';

-- Migration: add payment expiry (run if upgrading an existing schema)
-- alter table pages add column if not exists expires_at timestamptz;

-- Storage bucket (run in Supabase dashboard → Storage → New bucket)
-- Bucket name: lovepages
-- Public: true
-- Allowed MIME types: image/*, audio/*, video/*
-- Max file size: 50MB
