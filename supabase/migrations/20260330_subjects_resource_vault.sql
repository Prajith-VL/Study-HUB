-- Study Hub Day 2: Subject Management + Resource Vault
-- Run this migration in Supabase SQL editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'resource_type') then
    create type public.resource_type as enum (
      'course_link',
      'youtube_playlist',
      'github_repo',
      'drive_link',
      'syllabus_pdf',
      'pyq_pdf',
      'ebook_pdf'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'resource_priority') then
    create type public.resource_priority as enum ('low', 'medium', 'high');
  end if;
end $$;

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2),
  semester text not null check (char_length(trim(semester)) >= 2),
  color text not null check (color ~ '^#([A-Fa-f0-9]{6})$'),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists subjects_user_id_idx on public.subjects(user_id);
create index if not exists subjects_created_at_idx on public.subjects(created_at desc);
create index if not exists subjects_name_idx on public.subjects using gin (to_tsvector('simple', name));

create table if not exists public.subject_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  resource_type public.resource_type not null,
  priority public.resource_priority not null default 'medium',
  unit_label text,
  topic_label text,
  url text,
  storage_bucket text,
  storage_path text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  check (
    (url is not null and storage_path is null and storage_bucket is null)
    or (url is null and storage_path is not null and storage_bucket is not null)
  )
);

create index if not exists subject_resources_user_id_idx on public.subject_resources(user_id);
create index if not exists subject_resources_subject_id_idx on public.subject_resources(subject_id);
create index if not exists subject_resources_type_idx on public.subject_resources(resource_type);
create index if not exists subject_resources_created_at_idx on public.subject_resources(created_at desc);

alter table public.subjects enable row level security;
alter table public.subject_resources enable row level security;

drop policy if exists "subjects_select_own" on public.subjects;
create policy "subjects_select_own"
  on public.subjects
  for select
  using (auth.uid() = user_id);

drop policy if exists "subjects_insert_own" on public.subjects;
create policy "subjects_insert_own"
  on public.subjects
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "subjects_update_own" on public.subjects;
create policy "subjects_update_own"
  on public.subjects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "subjects_delete_own" on public.subjects;
create policy "subjects_delete_own"
  on public.subjects
  for delete
  using (auth.uid() = user_id);

drop policy if exists "resources_select_own" on public.subject_resources;
create policy "resources_select_own"
  on public.subject_resources
  for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "resources_insert_own" on public.subject_resources;
create policy "resources_insert_own"
  on public.subject_resources
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "resources_update_own" on public.subject_resources;
create policy "resources_update_own"
  on public.subject_resources
  for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "resources_delete_own" on public.subject_resources;
create policy "resources_delete_own"
  on public.subject_resources
  for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('syllabus', 'syllabus', false, 10485760, array['application/pdf']),
  ('pyqs', 'pyqs', false, 15728640, array['application/pdf']),
  ('ebooks', 'ebooks', false, 26214400, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "storage_select_own" on storage.objects;
create policy "storage_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id in ('syllabus', 'pyqs', 'ebooks')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "storage_insert_own" on storage.objects;
create policy "storage_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('syllabus', 'pyqs', 'ebooks')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "storage_update_own" on storage.objects;
create policy "storage_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('syllabus', 'pyqs', 'ebooks')
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id in ('syllabus', 'pyqs', 'ebooks')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "storage_delete_own" on storage.objects;
create policy "storage_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('syllabus', 'pyqs', 'ebooks')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

