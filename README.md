# 🎮 Bynamdy — Game News, Codes & Gear

A complete, SEO-ready gaming website with a hidden 2FA-protected admin dashboard.

- **Public site**: Home, News (+ full article pages), Cheat Codes (searchable, per-code pages), Wallpapers (gallery + downloads), Freebies, Store (affiliate), About, Contact.
- **Admin**: create/edit/delete articles, cheat codes, wallpapers (image upload), freebies and store products; edit every page text and SEO tagline; manage contact messages; change email/password; traffic counter.
- **Stack**: Next.js 16 (App Router) · TypeScript · Tailwind 4 · shadcn/ui · Prisma (SQLite for dev, PostgreSQL/Supabase in production).

**Full deployment guide: [`DEPLOYMENT.md`](./DEPLOYMENT.md)**

## Quick start (local)

```bash
cp .env.example .env        # then edit values
bun install
bun run db:push
bun scripts/seed.ts
bun run dev                 # http://localhost:3000
```

## Where is the admin?

Open **`/admin`** (e.g. `https://yoursite.com/admin`). It is intentionally hidden:
no link to it exists anywhere on the public site, and `robots.txt` blocks crawlers.

Default local credentials (from `.env`): `admin@bynamdy.com` / `BynamdyAdmin2026!`
On first login you scan a QR code with your authenticator app and receive backup codes.

## Deploying

- **Cloudflare (Workers + Hyperdrive, $0/month):** see **[DEPLOYMENT-CLOUDFLARE.md](./DEPLOYMENT-CLOUDFLARE.md)**
- **Netlify + Supabase:** see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

Both guides are free-tier only and cover exactly where to set your admin
email, password and 2FA.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Dev server on port 3000 |
| `bun run lint` | ESLint |
| `bun run db:push` | Apply the Prisma schema to the database |
| `bun scripts/seed.ts` | Seed demo content + create the admin user |
| `bun run build` | Production build (Node hosts) |
| `npm run cf:deploy` | Build + deploy to Cloudflare Workers (see DEPLOYMENT-CLOUDFLARE.md) |
| `npm run db:switch:postgres` | Switch schema to PostgreSQL before Supabase deploy |
| `npm run db:switch:sqlite` | Switch schema back to SQLite for local dev |
