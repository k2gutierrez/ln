-- ============================================================
-- ConIntención (ln) — Esquema de base de datos
-- Reconstruido a partir del código de la app.
--
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com/dashboard
--   2. SQL Editor > New query > pega todo este archivo > Run
--   3. Copia la URL y las llaves del proyecto a .env.local
--
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ============================================================

-- ------------------------------------------------------------
-- TABLAS
-- ------------------------------------------------------------

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  content       text,
  image_url     text,
  is_published  boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists articles_published_at_idx
  on public.articles (published_at desc);

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text,
  bio            text,
  avatar_url     text,
  linkedin_url   text,
  instagram_url  text,
  updated_at     timestamptz not null default now()
);

create table if not exists public.daily_quotes (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.events (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  event_date         timestamptz not null,
  location           text,
  registration_link  text,
  description        text,
  image_url          text,
  created_at         timestamptz not null default now()
);

create index if not exists events_event_date_idx
  on public.events (event_date);

create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references public.articles (id) on delete cascade,
  user_name       text not null default 'Anónimo',
  content         text not null,
  is_admin_reply  boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists comments_article_id_idx
  on public.comments (article_id, created_at);

-- ------------------------------------------------------------
-- PERFIL AUTOMÁTICO AL CREAR USUARIO
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- RLS (Row Level Security)
-- ------------------------------------------------------------
alter table public.articles     enable row level security;
alter table public.profiles     enable row level security;
alter table public.daily_quotes enable row level security;
alter table public.events       enable row level security;
alter table public.comments     enable row level security;

-- Lectura pública
drop policy if exists "articles: lectura pública" on public.articles;
create policy "articles: lectura pública"
  on public.articles for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "profiles: lectura pública" on public.profiles;
create policy "profiles: lectura pública"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "daily_quotes: lectura pública" on public.daily_quotes;
create policy "daily_quotes: lectura pública"
  on public.daily_quotes for select
  to anon, authenticated
  using (true);

drop policy if exists "events: lectura pública" on public.events;
create policy "events: lectura pública"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "comments: lectura pública" on public.comments;
create policy "comments: lectura pública"
  on public.comments for select
  to anon, authenticated
  using (true);

-- Escritura para el panel de administración (usuario autenticado).
-- Los comentarios públicos se insertan con la service role key desde
-- /api/comments, que ignora RLS a propósito.
do $$
declare
  t text;
begin
  foreach t in array array['articles', 'profiles', 'daily_quotes', 'events', 'comments']
  loop
    execute format('drop policy if exists "%s: escritura admin" on public.%I', t, t);
    execute format(
      'create policy "%s: escritura admin" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- STORAGE: bucket "media" (imágenes de artículos, eventos y perfil)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media: lectura pública" on storage.objects;
create policy "media: lectura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media: escritura autenticada" on storage.objects;
create policy "media: escritura autenticada"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media: actualización autenticada" on storage.objects;
create policy "media: actualización autenticada"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media: borrado autenticado" on storage.objects;
create policy "media: borrado autenticado"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
