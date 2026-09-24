# Riet's Retreat and Polish — Website & Admin Dashboard

A production website and password-protected admin dashboard for **Riet's Retreat and
Polish**, a salon/barber shop in Kabarnet, Baringo County, Kenya.

Built with **Next.js 14** (App Router, TypeScript, Tailwind) and **Supabase**
(Postgres database + Auth). Deploys to **Vercel**, code lives on **GitHub** — exactly
the stack you asked for.

---

## 1. What's included

**Public site** (`/`)
- Home, Services (with prices/durations), Booking form, Call-in/House Service
  form, Gallery, About, Contact (phone/WhatsApp/map/TikTok), testimonials on the
  home page, working hours in the header data and footer.
- Mobile-first, responsive, black/gold/cream branding matching the TikTok
  presence ([@jayharriet8](https://www.tiktok.com/@jayharriet8)).

**Admin dashboard** (`/admin`, login-gated)
- `/admin/login` — Supabase email/password sign-in
- `/admin` — overview stats
- `/admin/bookings` — view/confirm/reschedule/cancel both in-salon and
  call-in bookings, filter by type and status, assign staff
- `/admin/walkins` — quick-entry log for front-desk walk-ins
- `/admin/staff` — add/edit/remove staff, assign roles, schedule shifts
- `/admin/sales` — revenue charts by day, by service, by staff (7/30/90 days)
- `/admin/reports` — totals + most popular services over any date range
- `/admin/content` — edit services & prices, working hours, and gallery
  images without touching code

All data (services, bookings, staff, shifts, walk-ins, gallery, testimonials,
site settings) is stored in Supabase Postgres and persists — nothing is mock
data.

**Security**: `/admin/*` is protected by Next.js middleware that checks for a
valid Supabase session and redirects to `/admin/login` otherwise. There is no
public sign-up — admin accounts are created by hand in the Supabase dashboard
(see step 3 below), and Row Level Security policies mean only signed-in users
can read or write staff/bookings/walk-in data even if someone finds the
`/admin` URL.

---

## 2. Project structure

```
src/
  app/
    layout.tsx, page.tsx          Home page + shared header/footer
    services/, booking/, callin/, gallery/, about/, contact/
    admin/
      login/                      Sign-in page
      page.tsx                    Dashboard overview
      bookings/, walkins/, staff/, sales/, reports/, content/
    globals.css
    middleware.ts (src/middleware.ts) Route protection for /admin
  components/                     Shared UI (header, footer, booking form)
  components/admin/               Admin dashboard shell/sidebar
  lib/
    supabase/client.ts            Browser Supabase client
    supabase/server.ts            Server Supabase client
    constants.ts, types.ts, settings.ts
supabase/
  schema.sql                      Full DB schema, RLS policies, seed data
```

---

## 3. Setting up Supabase (do this first)

1. Go to [supabase.com](https://supabase.com) and create a new project
   (choose a region close to Kenya, e.g. Europe or a low-latency option).
2. Once it's ready, open **SQL Editor → New query**, paste in the entire
   contents of `supabase/schema.sql` from this project, and run it. This
   creates every table, security policy, and the starter placeholder
   services/hours/testimonials you can edit later.
3. Create your first admin login: go to **Authentication → Users → Add
   user**, enter the salon owner's email and a password. That's it — anyone
   signed in with Supabase Auth is treated as staff/admin (there's no public
   registration form, so this is the only way in). Add one user per staff
   member who needs dashboard access.
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this one secret — it's included for future use
     but the app currently only needs the anon key + RLS)

---

## 4. Running it locally

```bash
cp .env.local.example .env.local
# then paste your Supabase URL + anon key into .env.local

npm install
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the dashboard.

---

## 5. Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial build: Riet's Retreat and Polish"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

(`.env.local` is already in `.gitignore` — your Supabase keys will never be
committed.)

---

## 6. Deploying on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   the GitHub repo you just pushed.
2. Vercel auto-detects Next.js — no build settings to change.
3. Before deploying, add the environment variables (**Settings →
   Environment Variables**, or in the import screen):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional for now, but fine to add)
4. Deploy. Vercel gives you a `.vercel.app` URL immediately; attach the
   salon's real domain afterwards under **Settings → Domains**.

Every future `git push` to `main` auto-deploys.

---

## 7. Handing this off to the client (non-technical)

Once deployed, the client never needs to touch code:
- **Prices, services, hours, gallery photos** → `/admin/content`
- **Bookings & house-call requests** → `/admin/bookings`
- **Walk-in customers** → `/admin/walkins`
- **Staff & shifts** → `/admin/staff`
- **Daily/weekly/monthly sales** → `/admin/sales`

Give the salon owner their Supabase Auth email/password (created in step 3)
and the `/admin/login` link. Bookmark it on their phone/desktop — the URL is
not linked anywhere on the public site.

### Replacing placeholder content
- **Services & prices**: seeded with example salon/barber services — edit or
  delete them from `/admin/content`.
- **Gallery**: currently shows empty placeholder tiles. Upload real photos
  somewhere with a public URL (Supabase Storage is a good free option — create
  a `gallery` bucket, make it public, upload images, and paste each image's
  URL into `/admin/content`).
- **About page copy**: two paragraphs in `src/app/about/page.tsx` are marked
  `[Editable]` — replace with the real founding story before launch.
- **Phone/WhatsApp/email**: currently placeholders (`+254 7XX XXX XXX`, etc.)
  in the seed data (`supabase/schema.sql`, `contact` row) — update via a
  Supabase table edit (`site_settings` → `contact` row) since there's no
  dedicated admin screen for this yet; happy to add one if useful.
- **Staff names**: two placeholder staff rows are seeded — edit or remove
  them from `/admin/staff`.

---

## 8. What I'd still recommend before go-live

- Add real photography to the gallery and hero.
- Load-test the booking form with a real phone number end-to-end (submit →
  confirm it appears in `/admin/bookings`).
- Consider SMS/WhatsApp notifications on new bookings (not built yet — would
  need a provider like Africa's Talking or Twilio).
- Point a custom domain (e.g. `rietsretreat.co.ke`) at the Vercel deployment.
