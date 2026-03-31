# Study Hub

Study Hub is a modern academic productivity workspace built with Next.js and Supabase. It combines subject management, notes, planning, resource organization, video progress tracking, and analytics in a single application designed for students.

## Overview

Study Hub helps users:

- organize subjects and semester progress
- store learning resources and PDFs
- write and manage subject-linked notes
- plan study tasks and revision rounds
- track course or playlist progress
- review productivity and study analytics

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database and Storage
- Recharts
- Radix UI primitives

## Core Features

### Authentication

- email/password signup and login
- protected app routes
- Supabase session handling in middleware and server components

### Subjects

- create, update, search, and delete subjects
- progress tracking and semester labels
- subject workspace with nested overview, resources, and syllabus views

### Resources

- save course links, playlists, GitHub repos, and drive links
- upload syllabus, PYQ, and ebook PDFs
- mark important resources as favorites

### Notes

- create notes linked to subjects
- markdown-style writing experience
- autosave draft flow
- pinning, tags, search, and quick note creation

### Planner

- create and manage tasks
- due dates, status, priority, and revision rounds
- due-today and upcoming views

### Video Progress

- track playlist or course completion
- store total videos, completed videos, last watched, and linked note
- continue-learning card on dashboard

### Analytics

- weekly task completion
- note activity trend
- subject progress overview
- streak and quick productivity insights

## App Routes

### Public

- `/`
- `/login`
- `/signup`

### Protected

- `/dashboard`
- `/subjects`
- `/subjects/[id]`
- `/subjects/[id]/resources`
- `/subjects/[id]/syllabus`
- `/notes`
- `/notes/[id]`
- `/planner`
- `/analytics`
- `/settings`
- `/focus`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Add the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run Supabase Migrations

Run the SQL files in this order inside your Supabase project:

1. `supabase/migrations/20260330_subjects_resource_vault.sql`
2. `supabase/migrations/20260330_notes_planner_videos.sql`
3. `supabase/migrations/20260331_v1_1_premium_upgrades.sql`

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. Make sure your Supabase migrations are already applied.
6. Update Supabase Auth settings with your production site URL and redirect URLs.

### Recommended Post-Deploy Checks

- login and signup flow work
- protected routes redirect correctly
- subject CRUD works
- note creation and autosave work
- planner actions persist correctly
- analytics pages load without errors

## Project Structure

```text
app/                 Next.js app router pages, layouts, API routes, and server actions
components/          Reusable UI and feature components
lib/                 Queries, helpers, types, hooks, and integrations
supabase/migrations/ Database migration files
types/               Shared generated or app-level types
```

## Notes

- the app is designed around Supabase-backed authenticated users
- storage is used for PDF-based resources
- route protection is handled in middleware and protected layouts

## Status

The project is production-oriented and deployable, with the main user flows already implemented across authentication, subjects, notes, planner, videos, and analytics.
