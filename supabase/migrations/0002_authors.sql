-- ============================================================
-- authors — structured bylines (photo, bio, social links), distinct from
-- `profiles` (CMS login/staff accounts). An article's author_id used to
-- reference profiles(id); in practice every article so far has used the
-- free-text guest_author_name instead, so repointing it to a dedicated
-- authors table (rather than adding a second column) is a clean cut-over.
-- ============================================================
create table authors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  photo_path    text,
  bio           text,
  social_links  jsonb not null default '{}'::jsonb,  -- {x, instagram, facebook, linkedin, website}
  created_at    timestamptz not null default now()
);
alter table authors enable row level security;
create policy "public reads authors" on authors for select using (true);
create policy "staff insert authors" on authors for insert with check (is_staff());
create policy "staff update authors" on authors for update using (is_staff()) with check (is_staff());
create policy "staff delete authors" on authors for delete using (is_staff());

alter table articles drop constraint if exists articles_author_id_fkey;
alter table articles add constraint articles_author_id_fkey
  foreign key (author_id) references authors(id) on delete set null;
