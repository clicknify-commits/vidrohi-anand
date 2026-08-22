-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;
create extension if not exists pg_cron;

-- ============================================================
-- Enums
-- ============================================================
create type profile_role   as enum ('admin','editor','reporter');
create type article_status as enum ('draft','in_review','scheduled','published','archived');

-- ============================================================
-- profiles  (id, user_id -> auth.users, display_name, role)
-- ============================================================
create table profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  display_name  text not null,
  role          profile_role not null default 'reporter',
  created_at    timestamptz not null default now()
);

-- Security-definer helpers used throughout RLS below. search_path is pinned
-- so these can't be tricked by a session-level search_path change.
create or replace function public.is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles p where p.user_id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin');
$$;

alter table profiles enable row level security;
create policy "staff read profiles" on profiles for select using (is_staff());
create policy "admin manages profiles" on profiles for all using (is_admin()) with check (is_admin());

-- ============================================================
-- categories  (id, name_hi, name_en, slug, sort_order, is_active)
-- ============================================================
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name_hi     text not null,
  name_en     text not null,
  slug        text not null unique,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table categories enable row level security;
create policy "public reads active categories" on categories for select using (is_active or is_staff());
create policy "staff insert categories" on categories for insert with check (is_staff());
create policy "staff update categories" on categories for update using (is_staff()) with check (is_staff());
create policy "staff delete categories" on categories for delete using (is_staff());

-- ============================================================
-- tags  (id, name, + slug for future internal-linking use)
-- ============================================================
create table tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);
alter table tags enable row level security;
create policy "anyone reads tags" on tags for select using (true);
create policy "staff insert tags" on tags for insert with check (is_staff());
create policy "staff update tags" on tags for update using (is_staff()) with check (is_staff());
create policy "staff delete tags" on tags for delete using (is_staff());

-- ============================================================
-- articles
-- ============================================================
create table articles (
  id                  uuid primary key default gen_random_uuid(),
  headline            text not null,
  dek                 text,
  slug                text not null unique,
  body                jsonb not null default '{}'::jsonb,
  category_id         uuid not null references categories(id),
  city_tag            text,
  status              article_status not null default 'draft',
  author_id           uuid references profiles(id),
  guest_author_name   text,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  is_breaking         boolean not null default false,
  seo_title           text,
  seo_description     text,
  focus_keyword       text,
  canonical_url       text,
  og_image_id         uuid,
  robots_index        boolean not null default true
);

create index articles_status_published_idx on articles (status, published_at desc);
create index articles_category_idx on articles (category_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger articles_set_updated_at before update on articles
  for each row execute function public.set_updated_at();

alter table articles enable row level security;
create policy "public reads published articles" on articles
  for select using (status = 'published' or is_staff());
create policy "staff insert articles" on articles for insert with check (is_staff());
create policy "staff update articles" on articles for update using (is_staff()) with check (is_staff());
create policy "staff delete articles" on articles for delete using (is_staff());

-- ============================================================
-- article_images  (the 5-image-rule: position 1-5, position 1 is featured)
-- ============================================================
create table article_images (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references articles(id) on delete cascade,
  "position"      smallint not null check ("position" between 1 and 5),
  storage_path    text not null,      -- "full" derivative
  thumbnail_path  text not null,
  card_path       text not null,
  original_path   text,
  width           int,
  height          int,
  alt_text        text not null default '',
  caption         text,
  credit          text,
  focal_x         real not null default 0.5,
  focal_y         real not null default 0.5,
  created_at      timestamptz not null default now(),
  unique (article_id, "position")
);
alter table article_images enable row level security;
create policy "public reads images of published articles" on article_images
  for select using (
    is_staff() or exists (select 1 from articles a where a.id = article_images.article_id and a.status = 'published')
  );
create policy "staff insert images" on article_images for insert with check (is_staff());
create policy "staff update images" on article_images for update using (is_staff()) with check (is_staff());
create policy "staff delete images" on article_images for delete using (is_staff());

alter table articles
  add constraint articles_og_image_fk foreign key (og_image_id)
  references article_images(id) on delete set null;

-- ============================================================
-- article_tags junction
-- ============================================================
create table article_tags (
  article_id uuid not null references articles(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);
alter table article_tags enable row level security;
create policy "public reads tags of published articles" on article_tags
  for select using (
    is_staff() or exists (select 1 from articles a where a.id = article_tags.article_id and a.status = 'published')
  );
create policy "staff insert article_tags" on article_tags for insert with check (is_staff());
create policy "staff delete article_tags" on article_tags for delete using (is_staff());

-- ============================================================
-- article_revisions — version history / rollback
-- ============================================================
create table article_revisions (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  snapshot    jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references profiles(id)
);
alter table article_revisions enable row level security;
create policy "staff read revisions" on article_revisions for select using (is_staff());
create policy "staff insert revisions" on article_revisions for insert with check (is_staff());

-- ============================================================
-- redirects — stores full pathnames, e.g. '/rashtriya/old-headline-slug'
-- ============================================================
create table redirects (
  id          uuid primary key default gen_random_uuid(),
  old_slug    text not null unique,
  new_slug    text not null,
  created_at  timestamptz not null default now()
);
alter table redirects enable row level security;
create policy "public reads redirects" on redirects for select using (true);
create policy "staff insert redirects" on redirects for insert with check (is_staff());
create policy "staff update redirects" on redirects for update using (is_staff()) with check (is_staff());
create policy "staff delete redirects" on redirects for delete using (is_staff());

-- ============================================================
-- settings — non-secret config only; real API keys live in env vars
-- ============================================================
create table settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table settings enable row level security;
create policy "public reads settings" on settings for select using (true);
create policy "staff insert settings" on settings for insert with check (is_staff());
create policy "staff update settings" on settings for update using (is_staff()) with check (is_staff());

insert into settings (key, value) values
  ('default_weather_city', '"New Delhi"'::jsonb),
  ('site_social_links', '{}'::jsonb);

-- ============================================================
-- Seed categories (10 named in the source doc; trim to 8 later via the
-- Category Manager UI if desired — no code change needed either way)
-- ============================================================
insert into categories (name_hi, name_en, slug, sort_order) values
  ('राष्ट्रीय',      'National',       'rashtriya',      1),
  ('अंतरराष्ट्रीय',   'International',  'antarrashtriya', 2),
  ('राज्य / शहर',    'State/City',     'rajya-shahar',   3),
  ('राजनीति',        'Politics',       'rajniti',        4),
  ('क्राइम',         'Crime',          'crime',          5),
  ('खेल',            'Sports',         'khel',           6),
  ('मनोरंजन',        'Entertainment',  'manoranjan',     7),
  ('बिजनेस',         'Business',       'business',       8),
  ('वीडियो',         'Video',          'video',          9),
  ('फोटो गैलरी',      'Photo Gallery',  'photo-gallery',  10);

-- ============================================================
-- Storage bucket + policies
-- ============================================================
insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true)
  on conflict (id) do nothing;

create policy "public read article-images" on storage.objects
  for select using (bucket_id = 'article-images');
create policy "staff write article-images" on storage.objects
  for insert with check (bucket_id = 'article-images' and public.is_staff());
create policy "staff update article-images" on storage.objects
  for update using (bucket_id = 'article-images' and public.is_staff());
create policy "staff delete article-images" on storage.objects
  for delete using (bucket_id = 'article-images' and public.is_staff());

-- ============================================================
-- Scheduled publish — flips status='scheduled' rows to 'published' once due,
-- every minute, so every other query/RLS policy only ever checks
-- status='published'. Requires the pg_cron extension enabled on the project
-- (Database -> Extensions in the Supabase dashboard).
-- ============================================================
select cron.schedule(
  'publish-scheduled-articles',
  '* * * * *',
  $$ update articles set status = 'published'
     where status = 'scheduled' and published_at <= now(); $$
);
