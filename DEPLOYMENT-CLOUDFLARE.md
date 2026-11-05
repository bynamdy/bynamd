# ☁️ Bynamdy — Deployment Guide (Cloudflare, $0/month)

This guide puts Bynamdy on **Cloudflare** using the official
**OpenNext → Cloudflare Workers** adapter. Everything below has a free tier:

| Piece | Service | Free tier |
| --- | --- | --- |
| Hosting (Next.js app + APIs, global edge) | **Cloudflare Workers** | 100k requests/day |
| Database connection pooling (optional) | **Cloudflare Hyperdrive** | free |
| Database (content, admin, messages, traffic) | **Supabase** Postgres | 500 MB |
| Image uploads (wallpapers, products) | **Supabase Storage** | 1 GB |

> Local development stays exactly the same (SQLite, `bun run dev`) — nothing
> in this guide changes how you work on your machine.

---

## Part 0 — Push the code to GitHub (3 min)

1. Create an empty repo on GitHub (e.g. `bynamdy`), then from the project root:
   ```bash
   git init
   git add -A
   git commit -m "Bynamdy gaming site — Cloudflare ready"
   git remote add origin https://github.com/YOURNAME/bynamdy.git
   git branch -M main
   git push -u origin main
   ```
2. `.env` is **not** committed (already in `.gitignore`) — good.

> **No git on your computer?** Use GitHub's web upload: open your repo →
> **Add file → Upload files** → open the unzipped project folder, press
> **Ctrl+A** (select *everything* inside it) and drag it all in one drop.
> Don't drag folders one by one from different places.

### ✅ Verify the repo structure before deploying

Open your repo on github.com. The **top level must look exactly like this**:

```
📂 db/            📂 prisma/        📂 public/
📂 scripts/       📂 src/           📄 .env.example
📄 .gitignore     📄 bun.lock       📄 components.json
📄 DEPLOYMENT.md  📄 DEPLOYMENT-CLOUDFLARE.md
📄 eslint.config.mjs  📄 next.config.ts  📄 open-next.config.ts
📄 package.json   📄 postcss.config.mjs  📄 README.md
📄 tailwind.config.ts  📄 tsconfig.json  📄 wrangler.jsonc
```

And `src/` must contain `app`, `components`, `lib`, `hooks`.

⚠️ **Red flags that WILL break the build:**
- An `app` folder at the top level (it must be inside `src/`)
- No `src/components` folder
- `package.json` without `@opennextjs/cloudflare`, `wrangler`, `pg`,
  `@prisma/adapter-pg` in its dependencies (open it on GitHub and search)

If you see any of these, the upload went wrong — delete the repo's contents
and re-upload the zip contents in **one** selection.

---

## Part 1 — Create the Supabase database + storage (5 min)

1. Go to **[supabase.com](https://supabase.com)** → **New project**.
   - Name: `bynamdy`, region closest to your audience (e.g. `eu-west`, `us-east`).
   - Set a **database password** — save it.
2. Click **Connect** (top bar) → copy the **Connection string → Transaction pooler** URI:
   ```
   postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
   Replace `[YOUR-PASSWORD]`. **Keep this string — you'll use it twice**
   (Hyperdrive in Part 2, and schema push in Part 4).
3. Go to **Project Settings → API**:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role secret key** → this is `SUPABASE_SERVICE_ROLE_KEY`
     (⚠️ server-side only — never commit it or expose it in the browser)

---

## Part 2 — Hyperdrive binding (OPTIONAL — skip for your first deploy)

By default (`wrangler.jsonc` as shipped) the app connects to Supabase
directly using the `DATABASE_URL` variable — **no Hyperdrive needed to go
live**. Hyperdrive adds connection pooling + caching, which is worth enabling
once your traffic grows. When you're ready:

1. Log in to **[dash.cloudflare.com](https://dash.cloudflare.com)**.
2. Left sidebar → **Storage & Databases → Hyperdrive** → **Create Hyperdrive**.
   - Name: `bynamdy-db`
   - Connection string: paste the **Supabase transaction pooler URI** from Part 1.
   - Create → copy the **Hyperdrive ID** (looks like `b20b6a37e2d94...`).
3. Open `wrangler.jsonc`, **uncomment** the `"hyperdrive": [...]` block at the
   bottom and put your real ID in place of `YOUR_HYPERDRIVE_ID`:
   ```jsonc
   "hyperdrive": [
     { "binding": "HYPERDRIVE", "id": "b20b6a37e2d94..." }
   ]
   ```
   Commit and push this change.

---

## Part 3 — Create the Worker on Cloudflare (7 min)

> ⚠️ **MOST COMMON MISTAKE — read this first.** On the *Create* screen you
> will see two choices: **Workers** and **Pages**. You MUST pick
> **Workers → Import an existing Git repository**.
>
> If you pick **Pages**, the deploy fails with:
> `✘ [ERROR] Could not detect a directory containing static files (e.g. html, css and js)`
> — that error means you're in the Pages flow. Delete that project and start
> again in the **Workers** flow (this app is a server-rendered Next.js site,
> it cannot deploy as static Pages).

1. Dashboard → **Workers & Pages** → **Create** → choose **Workers** (not Pages) → **Import an existing Git repository** → pick `bynamdy`.
2. Cloudflare auto-detects the Next.js preset. Setup:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
3. **Before the first deploy**, open **Settings → Variables and Secrets** and add:

   | Key | Value |
   | --- | --- |
   | `SESSION_SECRET` | any long random string — run `openssl rand -hex 32` |
   | `ADMIN_EMAIL` | **the email you want to log in with** |
   | `ADMIN_PASSWORD` | **the password you want** (min 8 characters) |
   | `NEXT_PUBLIC_SITE_URL` | `https://bynamdy.<your-subdomain>.workers.dev` |
   | `DATABASE_URL` | the Supabase pooler URI (used by build tooling / fallback) |
   | `SUPABASE_URL` | from Part 1 — enables image uploads |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Part 1 — enables image uploads |

4. Click **Deploy**. The first build takes a few minutes; every `git push`
   afterwards redeploys automatically.

<details>
<summary>Alternative: deploy from your terminal with the CLI</summary>

```bash
npm i -g wrangler
wrangler login
npm run cf:deploy        # builds with OpenNext and deploys via wrangler
```
Set the same variables with `wrangler secret put SESSION_SECRET` (etc.) or in
**Workers & Pages → bynamdy → Settings → Variables and Secrets**.
</details>

---

## Part 4 — Push the schema + seed Supabase (one time, 3 min)

The Worker needs the tables + the admin account inside Supabase. Run this
**once from your machine**:

```bash
# 1. point Prisma at Postgres
npm run db:switch:postgres

# 2. put your Supabase transaction-pooler URI into .env (DATABASE_URL)
#    plus your real ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET

# 3. create the tables and the admin user + demo content
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts

# 4. switch the schema back to SQLite for future local dev (optional)
npm run db:switch:sqlite
```

The seed prints the admin email it created. **2FA is set up on your first
dashboard login** — the QR code appears then (next part).

---

## Part 5 — First login to the admin dashboard 🎮

1. Open `https://bynamdy.<your-subdomain>.workers.dev` — your site is live.
2. Go to **`/admin`** (typed manually — it is intentionally hidden: no link on
   the public site, and `robots.txt` blocks it from search engines).
3. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. **First login only:** a QR code appears → open **Google Authenticator**
   (or Authy / 1Password / Microsoft Authenticator) → **+** → *Scan QR code* →
   enter the 6-digit code → **Save the 10 backup codes** (Download button —
   shown once!).
5. You land in the **Control Room**: articles, cheat codes, wallpapers, freebies,
   store products, page text & SEO, messages, traffic, account settings.

Lost your phone? Run `bun scripts/reset-admin-2fa.ts` locally (it resets 2FA
so the next login shows the QR setup again), or use one of your backup codes
on the login screen.

---

## Part 6 — Custom domain (optional, free)

Workers & Pages → **bynamdy** → **Settings → Domains & Routes** → **Add →
Custom domain** → e.g. `bynamdy.com` (domain must be on your Cloudflare
account, free plan works). Update `NEXT_PUBLIC_SITE_URL` to your domain and
redeploy.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `✘ [ERROR] Could not detect a directory containing static files` during deploy | You created a **Pages** project instead of a **Workers** project. Delete the Pages project and redo Part 3 picking **Workers**. |
| `Hyperdrive ID ... is not valid` / deploy fails on the ID | The `hyperdrive` block in `wrangler.jsonc` is uncommented with a fake ID. Either re-comment it (Option A) or paste your real Hyperdrive ID (Part 2). |
| Site builds but pages throw 500 / "table does not exist" | Part 4 wasn't run — push schema + seed against Supabase. |
| `Hyperdrive ... not found` in logs | Wrong Hyperdrive ID in `wrangler.jsonc`, or the binding was deleted. |
| Upload button errors in admin | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` not set on the Worker, or the `media` bucket isn't public. |
| Login loops back / cookies rejected | Make sure `NEXT_PUBLIC_SITE_URL` matches the real site URL exactly. |
| "Too many attempts" on login | Built-in rate limit — wait 15 minutes. |
| Changed admin email/password | Dashboard → **Account Settings** (asks for current password). |

## Costs & limits (free tier)

- **Workers**: 100,000 requests/day — plenty for a new site.
- **Hyperdrive**: free, counts as Worker requests.
- **Supabase**: 500 MB database + 1 GB storage + 2 GB bandwidth.
- Image uploads: 8 MB max per file (JPG/PNG/WebP/GIF/AVIF).
