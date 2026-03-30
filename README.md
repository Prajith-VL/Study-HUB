# Study Hub SaaS - Day 1 Foundation

Production-ready starter with Next.js App Router, TypeScript, Tailwind, shadcn-style components, and Supabase auth.

## Stack
- Next.js 15 App Router
- TypeScript (strict)
- Tailwind CSS + reusable UI primitives
- Supabase Auth (email/password)
- Middleware route protection

## Routes
- `/login`
- `/signup`
- `/dashboard`
- `/subjects`
- `/notes`
- `/planner`
- `/analytics`
- `/settings`

## Setup
1. Install dependencies: `npm install`
2. Configure environment: copy `.env.example` to `.env.local`
3. Fill Supabase env values in `.env.local`
4. Run: `npm run dev`

## Auth Notes
- Email/password login and signup are active.
- Google auth button is UI placeholder only for now.
- Auth/session checks happen in middleware and protected layout.