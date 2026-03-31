-- Study Hub: Notes + Planner + Video Progress
-- Run in Supabase SQL editor after previous migrations.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'medium', 'high');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('todo', 'in_progress', 'completed');
  end if;
end $$;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  content text not null default '',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  due_date timestamptz not null,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  revision_round integer not null default 1 check (revision_round >= 1),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  url text not null,
  total_videos integer not null default 0 check (total_videos >= 0),
  completed_videos integer not null default 0 check (completed_videos >= 0),
  last_watched timestamptz,
  note_id uuid references public.notes(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  check (completed_videos <= total_videos)
);

create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_subject_id_idx on public.notes(subject_id);
create index if not exists notes_updated_at_idx on public.notes(updated_at desc);
create index if not exists notes_tags_gin_idx on public.notes using gin(tags);
create index if not exists notes_title_fts_idx on public.notes using gin(to_tsvector('simple', title || ' ' || content));

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_subject_id_idx on public.tasks(subject_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date asc);
create index if not exists tasks_status_idx on public.tasks(status);

create index if not exists videos_user_id_idx on public.videos(user_id);
create index if not exists videos_subject_id_idx on public.videos(subject_id);
create index if not exists videos_last_watched_idx on public.videos(last_watched desc);

create or replace function public.set_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_notes_updated_at();

alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.videos enable row level security;

drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own"
  on public.notes for select
  using (auth.uid() = user_id);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own"
  on public.notes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own"
  on public.notes for delete
  using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

drop policy if exists "videos_select_own" on public.videos;
create policy "videos_select_own"
  on public.videos for select
  using (auth.uid() = user_id);

drop policy if exists "videos_insert_own" on public.videos;
create policy "videos_insert_own"
  on public.videos for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "videos_update_own" on public.videos;
create policy "videos_update_own"
  on public.videos for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "videos_delete_own" on public.videos;
create policy "videos_delete_own"
  on public.videos for delete
  using (auth.uid() = user_id);

