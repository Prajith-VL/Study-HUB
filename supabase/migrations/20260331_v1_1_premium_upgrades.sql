-- Study Hub v1.1 premium upgrades

do $$
begin
  if not exists (select 1 from pg_type where typname = 'checklist_type') then
    create type public.checklist_type as enum ('topic', 'revision', 'syllabus');
  end if;
end $$;

alter table public.subjects add column if not exists is_pinned boolean not null default false;
alter table public.subjects add column if not exists exam_date date;

alter table public.subject_resources add column if not exists is_favorite boolean not null default false;

alter table public.tasks add column if not exists sort_order integer not null default 0;

create table if not exists public.subject_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  checklist_type public.checklist_type not null default 'topic',
  title text not null check (char_length(trim(title)) >= 2),
  unit_label text,
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists subject_checklists_user_idx on public.subject_checklists(user_id);
create index if not exists subject_checklists_subject_idx on public.subject_checklists(subject_id);
create index if not exists subject_checklists_type_idx on public.subject_checklists(checklist_type);

alter table public.subject_checklists enable row level security;

drop policy if exists "subject_checklists_select_own" on public.subject_checklists;
create policy "subject_checklists_select_own"
  on public.subject_checklists for select
  using (auth.uid() = user_id);

drop policy if exists "subject_checklists_insert_own" on public.subject_checklists;
create policy "subject_checklists_insert_own"
  on public.subject_checklists for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "subject_checklists_update_own" on public.subject_checklists;
create policy "subject_checklists_update_own"
  on public.subject_checklists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "subject_checklists_delete_own" on public.subject_checklists;
create policy "subject_checklists_delete_own"
  on public.subject_checklists for delete
  using (auth.uid() = user_id);

