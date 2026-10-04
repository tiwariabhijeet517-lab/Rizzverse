# RIZZVERSE'26 — IT Freshers' Party Registration

> Event tagline: Step In, Stand Out.  
> Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase  
> Deploy target: Vercel

---

## 1. Getting started (local dev)

```bash
cd Rizzverse
npm install
cp .env.example .env.local
# → fill in the Supabase values (see §3)
npm run dev
# → http://localhost:3000
```

Other scripts:
```bash
npm run lint   # ESLint via next lint
npm run build  # Production build
npm start      # Run built site
```

---

## 2. Project structure

```
Rizzverse/
├── public/                           # Static assets (add your upi-qr.png here)
├── src/
│   ├── app/
│   │   ├── api/register/route.ts     # Supabase-backed registration API
│   │   ├── register/page.tsx         # /register route
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Homepage
│   ├── components/                   # Reusable UI components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser-side Supabase (anon key)
│   │   │   └── server.ts             # Server-side Supabase (service role)
│   │   └── validateRegistration.ts   # Client + server validation logic
│   └── types/registration.ts         # Shared TS types + constants
├── supabase/
│   └── schema.sql                    # DB schema + RLS policies (run this)
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Supabase setup — do these in order

You'll need a Supabase project. If you don't have one yet:
1. Go to <https://supabase.com/dashboard/projects> and click **New project**.
2. Pick a password, a region close to your users, and wait for the DB to boot (~2 min).

### 3.1 Paste env vars

From your Supabase project go to **Project Settings → API** and copy these into `.env.local`:

| Variable in `.env.local`         | Where to get it                                                            |
| -------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Project URL (Project Settings → API → Project URL)                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `anon` public key (safe for the browser)                                   |
| `SUPABASE_SERVICE_ROLE_KEY`      | `service_role` key (⚠️ **never expose to client / commit to git**)         |
| `SUPABASE_PAYMENT_BUCKET`        | `payment-proofs`  (keep this default unless you rename it in dashboard)    |

### 3.2 Run the database schema

Open **SQL Editor → New Query** in Supabase, then paste the whole contents of:
```
supabase/schema.sql
```
Click **Run**. This creates:
- `payment_status` enum (`Pending`, `Verified`, `Rejected`)
- `registrations` table with UUID `id` and all required fields
- Unique constraints on `college_email` (case-insensitive) and `roll_number` (case-insensitive)
- `handle_updated_at()` trigger
- **Row Level Security (RLS) enabled** — by default, nobody using the public `anon` key can read or write the `registrations` table directly. Writes happen server-side via the service-role key in `api/register/route.ts`.

### 3.3 Create the private storage bucket

1. In Supabase Dashboard go to **Storage**.
2. Click **New bucket**.
3. Name: `payment-proofs`
4. Toggle **OFF** "Public bucket". Confirm with **Create bucket**.
5. The storage RLS policies at the bottom of `supabase/schema.sql` are applied automatically when you run the schema file.

### 3.4 Promote the FIRST admin (required for dashboard access)

There is **no public admin sign-up**. You must manually create the first admin:

1. **Create an Auth user** in Supabase Dashboard → **Authentication → Users → Add user → Create new user**. Use the organiser's email (e.g. `you@college.edu.in`) and a strong password. (Do NOT use "Send password reset email" – pick "Autogenerate password" or "Create user with password".)
2. **Open SQL Editor** and run:
   ```sql
   -- Replace with the exact email you just added in Auth:
   INSERT INTO admin_users (email, display_name)
   VALUES ('you@college.edu.in', 'First Organizer')
   ON CONFLICT (email) DO NOTHING;
   ```
3. After that first admin exists, they can sign in at `/admin` and, if needed, add more admins by re-running the same INSERT with another email (or another organizer can run the SQL).

### 3.5 Add your real UPI QR code

Drop your QR PNG/JPG at:
```
public/upi-qr.png
```
Then edit `src/components/PaymentSection.tsx` and replace the placeholder div with a real `next/image` tag (`import Image from "next/image"`) pointing to `/upi-qr.png`.

---

## 4. Live registration count

The homepage at `/` fetches a **public, anonymous** count from:
```
GET /api/registrations/count
```
Only the count is returned – no student data. The endpoint is cached with `s-maxage=15, stale-while-revalidate=60` so the counter refreshes without a manual page reload. State handling inside the component covers:
- Loading spinner
- Error + retry button if Supabase is unreachable
- Gradient live-count pill with pulsing dot when loaded

---

## 5. Admin login & dashboard

### 5.1 Login flow

1. Go to `/admin`. If you're already a verified admin, the server redirects you straight to `/admin/dashboard`.
2. Otherwise, the login form at `/admin` calls Supabase Auth with `signInWithPassword()` from the browser (anon key only – the service-role key is never exposed client-side).
3. After a successful Auth sign-in, the dashboard server layout then re-checks server-side that the authenticated email **also exists in the `admin_users` table**. If the email is not in `admin_users`, you get a not-authorized error / redirect, even though you could technically log in with Supabase Auth.

**In short:**
- Supabase Auth answers "is this a real user?"
- `admin_users` answers "is this user an organizer?"

Both must pass. This is enforced on **every** admin page render AND in every `/api/admin/*` route handler independently, so hiding the UI doesn't stop a non-admin.

### 5.2 Dashboard features

`/admin/dashboard` shows:
- **4 stat cards:** Total, Pending, Verified, Rejected (live from the same query, no double-fetch)
- **Search box:** filters by name, email, mobile, roll, department, year, UPI UTR (case-insensitive substring)
- **Status filter pills:** All / Pending / Verified / Rejected
- **Registrations table** (desktop + horizontal scroll on mobile) with:
  - Name + email
  - Roll / Department / Year
  - Mobile
  - UPI UTR
  - Registration date & time (Indian locale)
  - Colour-coded payment status badge
  - Row actions:
    - **Proof** — generates a **10-minute signed URL** via `/api/admin/proof/[path]` and opens a responsive modal. PDFs are displayed in an `<iframe>`; images in an `<img>`; "Open in new tab" included.
    - **Verify** — confirmation modal → PATCH `/api/admin/registrations/[id]/status` with `{status:"Verified"}`. Saves `verified_at` and `verified_by`.
    - **Reject** — confirmation modal → same PATCH endpoint with `{status:"Rejected"}`.
- **Refresh** button + counts/table auto-refresh after a status change.

### 5.3 Sign out

The header "Sign out" button calls `POST /api/admin/logout`, which uses the SSR Supabase client to revoke the session server-side, then re-directs back to `/admin`.

---

## 6. How registration works end to end

1. Student fills **Step 1 – Student Details** on `/register`. Client validation runs.
2. **Continue to Payment** advances to **Step 2 – Payment** (same state object preserves data).
3. Student scans UPI QR, pays ₹1,200, enters UPI UTR, uploads screenshot (JPG/PNG/PDF, max 5 MB), checks confirmation, clicks **Submit Registration**.
4. UI builds a `FormData` and `POST`s it to `/api/register`.
5. **`/api/register` (server-side, service-role key only):**
   - Parses multipart form
   - Re-validates every field + file size/MIME (server is the source of truth)
   - Pre-checks for duplicate college email or roll number and returns 409
   - Uploads screenshot to private `payment-proofs` bucket with UUID filename
   - Inserts into `registrations` with `payment_status = 'Pending'`
   - **Compensation:** if DB insert fails after upload (e.g., last-minute unique violation), the uploaded file is removed to avoid orphaned proofs
   - Returns `201 Created` with the new `registrationId`
6. UI shows the **"Registration submitted. Payment verification is pending"** banner.

Important rules:
- **Only the service-role key ever touches the DB.** The service-role key lives only in server code, bypasses RLS, and is never shipped to browsers.
- **Payment is never auto-verified.** Every new row lands as `Pending`. Only the organizer dashboard can flip it to `Verified` or `Rejected` – never by OCR'ing screenshots or matching UTR strings.
- **Screenshots are never public.** They live in the private bucket and require a 10-minute signed URL to be viewed.

---

## 7. Vercel deploy

1. Push this repo to GitHub/GitLab.
2. Go to <https://vercel.com/new> and import the repo.
3. Under **Environment Variables**, paste the same four variables from §3.1.
4. Hit **Deploy**. When deployment finishes, visit `$VERCEL_URL/register` to test end to end.
5. Note: After deployment, your **first admin user still must be created manually in the Supabase dashboard** (§3.4).
