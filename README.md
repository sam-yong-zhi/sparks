# Sparks

Personal idea capture app — dump raw thoughts, let Claude AI structure them, save to Supabase.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres)
- NextAuth.js v4 (GitHub OAuth, single-user)
- Anthropic SDK (claude-haiku)

---

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor** and run the following:

```sql
create type priority_level as enum ('normal', 'important', 'urgent');
create type idea_status as enum ('active', 'actioned', 'archived');

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

insert into categories (name) values
  ('Content Ideas'), ('Family'), ('Life Principles'),
  ('Shopping'), ('Health'), ('Work/AI'), ('Finance'), ('Random');

create table ideas (
  id uuid primary key default gen_random_uuid(),
  raw_input text not null,
  title text not null,
  summary text not null,
  category text not null,
  tags text[] default '{}',
  priority priority_level default 'normal',
  status idea_status default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on every edit
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger ideas_updated_at
before update on ideas
for each row execute function update_updated_at();
```

---

## 2. GitHub OAuth App Setup

1. Go to [github.com → Settings → Developer settings → OAuth Apps → New OAuth App](https://github.com/settings/developers)
2. Fill in:
   - **Application name:** Sparks
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy **Client ID** → `GITHUB_CLIENT_ID`
5. Generate a **Client Secret** → `GITHUB_CLIENT_SECRET`

> For production, update the homepage and callback URL to your Vercel domain.

---

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret (server-only) |
| `NEXTAUTH_SECRET` | Random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally, your Vercel URL in production |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `ALLOWED_GITHUB_USERNAME` | Your GitHub username — only this account can log in |

---

## 4. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to sign in with GitHub.

---

## 5. Vercel Deployment

1. Push the repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://sparks.vercel.app`)
5. Update your GitHub OAuth App's callback URL to `https://your-domain.vercel.app/api/auth/callback/github`
6. Deploy

---

## Notes

- The AI model is `claude-haiku-4-5-20251001` — verify this string against the [Anthropic docs](https://docs.anthropic.com) if you see model errors; update it in `src/lib/ai.ts`
- All routes are protected by NextAuth middleware — unauthenticated requests redirect to `/auth/signin`
- Only the GitHub username matching `ALLOWED_GITHUB_USERNAME` can authenticate
