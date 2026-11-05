# 🚀 Bynamdy — Deployment Guide (Netlify + Supabase, $0/month)

This guide takes the site from local sandbox to a live public URL with a working
admin dashboard, in about 20 minutes. Everything used has a free tier:

| Piece | Service | Free tier |
| --- | --- | --- |
| Hosting (Next.js app + APIs) | **Netlify** | 100 GB bandwidth/mo |
| Database (content, admin, messages, traffic) | **Supabase** Postgres | 500 MB |
| Image uploads (wallpapers, products) | **Supabase Storage** | 1 GB |

> Prefer Cloudflare Pages? The app deploys there too via `@cloudflare/next-on-pages`,
> but Netlify runs Next.js 16 server routes out of the box with zero config, so this
> guide uses Netlify as the primary path.

---

## Part 1 — Create the Supabase database (5 min)

1. Go to **[supabase.com](https://supabase.com)** → **New project**.
   - Name: `bynamdy`, choose the region closest to you (e.g. `eu-west` or `us-east`).
   - Set a **database password** — save it, you'll paste it in step 3.
2. When the project is ready, click **Connect** (top bar) and copy the
   **Connection string → Transaction pooler** URI. It looks like:
   ```
   postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with the password from step 1. **This is your `DATABASE_URL`.**

### Enable image uploads (optional but recommended)

4. In Supabase, go to **Project Settings → API**:
   - Copy the **Project URL** → this is `SUPABASE_URL`
   - Copy the **service_role secret key** → this is `SUPABASE_SERVICE_ROLE_KEY`
     (⚠️ server-side only, never commit it or expose it in the browser)

The admin upload button auto-creates a public bucket named `media` on first use.

---

## Part 2 — Push the code to GitHub (3 min)

1. Create an empty repo on GitHub (e.g. `bynamdy`), then from the project root:
   ```bash
   git init
   git add -A
   git commit -m "Bynamdy gaming site"
   git remote add origin https://github.com/YOURNAME/bynamdy.git
   git push -u origin main
   ```
2. Make sure `.env` is **not** committed (it's already in `.gitignore`).

---

## Part 3 — Deploy on Netlify (7 min)

1. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site → Import an existing project** → pick your GitHub repo.
2. Netlify auto-detects Next.js. Before clicking Deploy, open
   **Site configuration → Environment variables** and add:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | your Supabase pooled URL from Part 1 |
   | `SESSION_SECRET` | any long random string — run `openssl rand -hex 32` and paste it |
   | `ADMIN_EMAIL` | **the email you want to log in with** |
   | `ADMIN_PASSWORD` | **the password you want** (min 8 characters) |
   | `NEXT_PUBLIC_SITE_URL` | `https://YOUR-SITE-NAME.netlify.app` (your real Netlify URL) |
   | `SUPABASE_URL` | from Part 1 (skip if you don't want uploads) |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Part 1 (skip if you don't want uploads) |

3. One **schema switch** is needed before the first build (the project ships with
   SQLite for local dev). Locally run:
   ```bash
   npm run db:switch:postgres
   git add prisma/schema.prisma && git commit -m "Use Postgres" && git push
   ```
4. Click **Deploy site** and wait for the build to finish.

---

## Part 4 — Create the tables + your admin account (3 min)

From your **local machine**, with `.env` pointing at Supabase
(copy `.env.example` to `.env` and fill the same values as above, including `DATABASE_URL`):

```bash
npm install
npm run db:switch:postgres      # if you didn't already in Part 3
npx prisma generate
npx prisma db push              # creates all tables in Supabase
npx tsx scripts/seed.ts         # seeds demo content + creates YOUR admin account
```

The seed script:
- creates the admin with **exactly the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`**
- fills the site with demo news, codes, wallpapers, freebies and products
  (delete or edit them from the dashboard once you're in)

> Want to change the admin email/password later? You don't need to re-seed —
> the dashboard's **Account Settings** page changes both (with current-password check).

---

## Part 5 — First login + 2FA setup (3 min)

1. Visit **`https://YOUR-SITE-NAME.netlify.app/admin`**
   (nothing on the public site links here — bookmark it privately).
2. Step 1: enter your **email** → Step 2: your **password**.
3. Because it's your first login, the site shows:
   - a **QR code** — open Google Authenticator / Authy / 1Password / Microsoft
     Authenticator on your phone → *add account → scan QR*
   - a manual entry code if you can't scan
   - **10 backup recovery codes** — download the `.txt` or copy them somewhere safe.
     Each works **once** if you ever lose your phone.
4. Enter the **6-digit code** from the app to confirm → 2FA is now enforced on every login.

That's it — the dashboard is live:

| Section | What you can do |
| --- | --- |
| Dashboard | total/today page views, 14-day chart, top pages, subscribers, unread messages |
| News Articles | create/edit/delete, publish toggle, cover image, SEO title/description |
| Cheat Codes | game, platform (PC/PS/Xbox/Mobile), code, effect, how-to details |
| Wallpapers | upload image or paste URL, category, resolution, feature on homepage |
| Freebies & Deals | free games / giveaways / deals with outbound links + expiry |
| Store Products | image, price, old price, category, **your affiliate link** |
| Page Text & SEO | tagline, hero texts, section titles, About/Contact body, home meta tags |
| Messages | read/reply/delete contact-form submissions |
| Account Settings | change email, change password (confirm + current check), regenerate backup codes |

---

## After launch checklist

- **Affiliate links**: store products ship with `https://www.amazon.com/dp/EXAMPLE…`
  placeholder URLs — replace them in **Admin → Store Products**.
- **Custom domain**: Netlify → Domain management → add your domain; then update
  `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` (sitemap/OG links follow it)
  and redeploy.
- **Social links**: footer icons are placeholders (`href="#"`) — edit
  `src/components/site-footer.tsx`.
- **SEO**: `sitemap.xml` and `robots.txt` are generated automatically at
  `/sitemap.xml` and `/robots.txt`. Submit the sitemap in Google Search Console.
- **Staging on SQLite again**: `npm run db:switch:sqlite` switches back.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Login says "Invalid email or password" | The admin row doesn't exist in Supabase — re-run `npx tsx scripts/seed.ts` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set |
| Image upload returns 501 | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` missing on Netlify — add them and redeploy (or paste image URLs) |
| "Incorrect code" at TOTP step | Phone clock drift — enable automatic time in the authenticator app; codes refresh every 30 s |
| Locked out (lost phone + no codes) | Reset from CLI: delete the row with `npx prisma studio` → Admin table, re-run the seed, log in again |
| Build fails on Netlify | Check you ran `npm run db:switch:postgres` and pushed; verify `DATABASE_URL` is the **pooler** URI on port 6543 |
