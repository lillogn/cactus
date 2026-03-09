-- ============================================================
-- CACTUS — Schema Supabase
-- Esegui questo nel SQL Editor di Supabase
-- ============================================================

-- Abilita UUID generation
create extension if not exists "uuid-ossp";

-- ─── PLACES ────────────────────────────────────────────────
create table if not exists public.places (
  id              uuid primary key default uuid_generate_v4(),
  place_id        text unique not null,       -- Google Place ID
  name            text not null,
  address         text,
  phone           text,
  category        text,
  primary_type    text,
  rating          numeric(3,1),
  reviews_count   integer,
  website         text,                       -- null = lead!
  has_website     boolean generated always as (website is not null) stored,
  lat             numeric(10,7),
  lng             numeric(10,7),
  city            text,
  neighborhood    text,
  maps_url        text,
  raw_data        jsonb,
  first_seen_at   timestamptz default now(),
  last_updated_at timestamptz default now()
);

create index if not exists places_place_id_idx on public.places(place_id);
create index if not exists places_city_idx on public.places(city);
create index if not exists places_has_website_idx on public.places(has_website);
create index if not exists places_city_neighborhood_idx on public.places(city, neighborhood);

-- ─── SEARCHES ──────────────────────────────────────────────
create table if not exists public.searches (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade,
  city            text not null,
  neighborhood    text,
  category        text not null,
  results_count   integer default 0,
  leads_count     integer default 0,         -- business senza sito
  from_cache      boolean default false,
  created_at      timestamptz default now()
);

create index if not exists searches_user_id_idx on public.searches(user_id);
create index if not exists searches_created_at_idx on public.searches(created_at desc);

-- ─── SEARCH RESULTS ────────────────────────────────────────
create table if not exists public.search_results (
  id          uuid primary key default uuid_generate_v4(),
  search_id   uuid references public.searches(id) on delete cascade,
  place_id    uuid references public.places(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(search_id, place_id)
);

-- ─── FAVORITES ─────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  place_id    uuid references public.places(id) on delete cascade,
  note        text,
  status      text default 'da_contattare'
              check (status in ('da_contattare','contattato','trattativa','cliente','perso')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, place_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

-- ─── RLS POLICIES ──────────────────────────────────────────
alter table public.places enable row level security;
alter table public.searches enable row level security;
alter table public.search_results enable row level security;
alter table public.favorites enable row level security;

-- Places: tutti gli autenticati possono leggere
create policy "Authenticated users can read places"
  on public.places for select
  to authenticated using (true);

-- Places: solo service role può inserire/aggiornare (dal backend)
create policy "Service role can insert places"
  on public.places for insert
  to service_role with check (true);

create policy "Service role can update places"
  on public.places for update
  to service_role using (true);

-- Searches: ogni utente vede solo le sue
create policy "Users see own searches"
  on public.searches for all
  to authenticated using (auth.uid() = user_id);

-- Search results: visibili se la ricerca è dell'utente
create policy "Users see own search results"
  on public.search_results for select
  to authenticated
  using (
    exists (
      select 1 from public.searches s
      where s.id = search_results.search_id
      and s.user_id = auth.uid()
    )
  );

create policy "Service role can insert search results"
  on public.search_results for insert
  to service_role with check (true);

-- Favorites: ogni utente gestisce i suoi
create policy "Users manage own favorites"
  on public.favorites for all
  to authenticated using (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger favorites_updated_at
  before update on public.favorites
  for each row execute procedure public.handle_updated_at();

create trigger places_updated_at
  before update on public.places
  for each row execute procedure public.handle_updated_at();
