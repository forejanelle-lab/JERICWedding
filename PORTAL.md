# Guest Portal Setup

The guest portal lets wedding guests connect before the celebration — coordinate rides, browse guest profiles, and join discussion boards for US and Europe-based travelers.

**No passwords or sign-in required.** Anyone with the link can browse and post.

## Prerequisites

1. A [Supabase](https://supabase.com) project (free tier works for ~105 guests)
2. Node.js 20+

## 1. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public or publishable key |

## 2. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run the contents of:

```
supabase/migrations/001_portal_schema.sql
supabase/migrations/002_open_access.sql
```

Migration `002_open_access.sql` removes auth requirements and opens public read/write access for the guest portal tables.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit:

- Wedding site: [http://localhost:3000](http://localhost:3000)
- Guest portal: [http://localhost:3000/portal](http://localhost:3000/portal)

## 4. Deploy (Vercel + Supabase)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local.example`
4. Ensure both SQL migrations have been run on your Supabase project

## Portal features

| Route | Description |
|-------|-------------|
| `/portal` | Dashboard with recent rides and discussions |
| `/portal/profile` | Add your profile + browse guest directory |
| `/portal/rides` | Offer or request rides (airport, hotel, venue) |
| `/portal/boards` | Discussion threads by category and region |
| `/portal/boards/[postId]` | Thread detail with replies |

## How it works

1. Guest visits `/portal` directly — no login
2. Guest adds their name when posting profiles, rides, threads, or replies
3. Guest directory, rides, and boards are visible to everyone

## Security notes

- Portal pages are `noindex` for search engines
- Open access: anyone can read, create, edit, and delete portal content
- Display names are shown publicly; no email addresses are collected in the portal
- For a private wedding, share the site URL only with invited guests
