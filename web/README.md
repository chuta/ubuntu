# Ubuntu GrowthOS — Web Application

Commercial Intelligence & Growth Operations Platform for Ubuntu Tribe.

**Stack:** Next.js 16 · Supabase · AWS S3 · Netlify · Anthropic (Week 5+)

## Week 1 Status ✅

- [x] Next.js app with Ubuntu Tribe branding (`logo.svg`, purple/gold theme)
- [x] Supabase schema migration (full ERM v1.0)
- [x] Email/password auth (login, register, callback)
- [x] App shell with sidebar navigation
- [x] Branded empty executive dashboard
- [x] Placeholder routes for all modules (Week 2–8)
- [x] Netlify deployment config

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migrations/20260620000001_initial_schema.sql`
3. Run `supabase/seed.sql` for territories, products, and tags
4. Enable **Email** auth under Authentication → Providers
5. Add redirect URL: `http://localhost:3000/auth/callback` (and your Netlify URL later)

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → register → dashboard.

### 4. Promote First Admin

After registering, run in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE email = 'your@email.com';
```

For executive read-only access:

```sql
UPDATE profiles SET role = 'EXECUTIVE' WHERE email = 'exec@email.com';
```

### 5. Deploy to Netlify

1. Connect repo to Netlify
2. Base directory: `web` (or use root `netlify.toml`)
3. Add environment variables in Netlify dashboard
4. Add production URL to Supabase auth redirect URLs

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, register
│   │   ├── (app)/           # Authenticated app shell
│   │   ├── auth/callback/   # Supabase OAuth callback
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── layout/          # Sidebar, header
│   │   └── ui/              # Button, input, card
│   └── lib/
│       ├── supabase/        # Client, server, middleware
│       └── constants/       # Navigation
├── supabase/
│   ├── migrations/          # ERM schema
│   └── seed.sql             # Territories, products, tags
└── public/
    └── logo.svg             # Ubuntu Tribe logo
```

## Week 2 Preview

- Organization CRUD (Government + Account profiles)
- Contact management
- Government and Account list/detail pages

## Documentation

Planning docs live in the repo root:

- `UBUNTU GROWTHOS PRD v1.0.md`
- `UBUNTU GROWTHOS DATA ARCHITECTURE & ERM v1.0.md`
- `UBUNTU GROWTHOS SOURCE DOCUMENTS INDEX.md`
