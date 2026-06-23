# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace structure

This directory contains two types of projects:

**Standalone HTML pages** (no build step — open directly in browser or serve with `npx serve`):
- `filth-homepage.html` — "The Filth" RDR2 roleplay gang homepage (dark western aesthetic, Rye font, gold palette)
- `ReachNest/index.html` — SaaS landing page (Inter/Bricolage Grotesque, blue accent)
- `nielsen-redesign/index.html` — Swedish construction company site (Playfair Display, navy/gold)
- `portal.html` — Swedish e-commerce electronics page
- `pixelquest.html` — Open-world RPG promo page
- `domain-graveyard.html` — Standalone page

**Next.js app** (`handtohand/`) — outbound sales/email campaign platform.

## handtohand — Next.js app

### Commands (run from `handtohand/`)
```
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
```

The preview server is also configured in `.claude/launch.json` as `"handtohand"` on port 3000.

### Stack
- **Next.js App Router** (TypeScript, Tailwind CSS)
- **Supabase** for auth and database (`@supabase/ssr`)
- No Clerk — auth is Supabase-only despite `.clerk/` temp files from bootstrapping

### Architecture

`app/page.tsx` is a pure marketing landing page composed of section components from `components/`. No data fetching on the marketing page.

Dashboard UI lives in `components/dashboard/` and currently uses mock data from `lib/mockData.ts` (no live DB queries wired up yet).

Auth utilities in `lib/auth.ts`:
- `getSession()` — returns current user + their `workspace_id` and `role`
- `createWorkspace()` — used in onboarding; calls `createAdminClient()` to bypass RLS

Supabase clients:
- `lib/supabase/client.ts` — browser client (anon key + RLS)
- `lib/supabase/server.ts` — server client (anon key + RLS) and `createAdminClient()` (secret key, bypasses RLS)

### Database schema (`lib/supabase/schema.sql`)
Multi-tenant, workspace-scoped. Core tables: `workspaces`, `workspace_members`, `companies`, `contacts`, `campaigns`, `sequences`, `sequence_steps`, `campaign_contacts`, `activities`. All tables use RLS via the `my_workspace_ids()` helper function. Run schema in Supabase Dashboard → SQL Editor.

### Environment variables needed
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

## Previewing standalone HTML files

```
npx serve . -p 5500
```

The `filth-homepage` server is pre-configured in `.claude/launch.json` on port 5500.
