# SecureAuth

A premium, dark-mode authentication and dashboard application built with **React + TypeScript + Vite + Tailwind CSS** on the frontend and **Supabase Auth + PostgreSQL (Row Level Security)** on the backend.

SecureAuth is not a mockup: authentication flows work against a real Supabase project, every sensitive data operation is enforced in the database, and the UI ships with loading, empty, error and success states throughout.

---

## 1. Architecture overview

```
┌──────────────────────────── Browser (React SPA) ────────────────────────────┐
│                                                                              │
│  React Router  ──►  Route guards (ProtectedRoute / AdminRoute)              │
│       │                     │                                                │
│       │              AuthProvider (session + profile + role)                │
│       │                     │                                                │
│       ▼                     ▼                                                │
│  Pages / Components ──►  Service layer (lib/services/*)                     │
│                                 │                                            │
│                          supabase-js client (anon key only)                 │
└─────────────────────────────────┼────────────────────────────────────────────┘
                                   │ HTTPS
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                              Supabase                                         │
│                                                                               │
│   Auth  ─ (sign up / in, email confirm, password recovery, sessions)         │
│   PostgREST  ──►  PostgreSQL "profiles" table                                 │
│                    • Row Level Security policies                               │
│                    • SECURITY DEFINER helper functions (is_admin, etc.)        │
│                    • SECURITY DEFINER admin RPCs (server-authorised)          │
│                    • auth.users INSERT trigger creates the profile            │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Key principles**

- **Supabase Auth is the single source of identity truth.** Passwords live only in `auth.users`, never in the app database.
- **Defense in depth:** the frontend role check is UX-only. The real authorisation boundary is Row Level Security plus `SECURITY DEFINER` database functions that re-check `is_admin()` server-side.
- **Least privilege:** every new account is created with the `user` role. There is no self-service path to become an administrator.
- **No fabricated data:** dashboards display real values from the database or clearly labelled roadmap placeholders.

---

## 2. Project structure

```
secureauth/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                 # Design-system primitives (Button, Input, Card, …)
│   │   ├── layout/             # AuthLayout, DashboardLayout, Sidebar, Topbar
│   │   ├── dashboard/          # StatCard, PageHeader, ConfirmDialog, EmptyState
│   │   └── ErrorBoundary.tsx
│   ├── contexts/
│   │   ├── auth-context.ts     # createContext + useAuth + types
│   │   └── AuthContext.tsx     # AuthProvider implementation
│   ├── hooks/                  # useDocumentTitle, useDebounce, useAdminUsers, …
│   ├── lib/
│   │   ├── supabase.ts         # singleton client
│   │   ├── authStorage.ts      # "Remember me" storage adapter
│   │   ├── env.ts              # validated environment access
│   │   ├── errors.ts           # safe, non-enumerating error messages
│   │   ├── redirect.ts         # open-redirect protection
│   │   ├── validation.ts       # Zod schemas + password rules
│   │   ├── cn.ts / format.ts
│   │   └── services/
│   │       ├── profiles.ts     # profile data-access (RLS-protected)
│   │       └── admin.ts        # admin RPC data-access
│   ├── pages/
│   │   ├── Login.tsx  Register.tsx
│   │   ├── ForgotPassword.tsx  ResetPassword.tsx  AuthCallback.tsx
│   │   ├── UserOverview.tsx  Profile.tsx  SecuritySettings.tsx  HelpSupport.tsx
│   │   ├── Legal.tsx  NotFound.tsx
│   │   └── admin/
│   │       ├── AdminOverview.tsx  UserManagement.tsx
│   │       ├── ProfileManagement.tsx  AdminSecurity.tsx
│   ├── routes/                 # nav config, guards, layout wrappers, AppRoutes
│   ├── types/                  # database.ts (typed schema)
│   ├── test/                   # vitest setup
│   ├── App.tsx  main.tsx
│   └── styles/globals.css
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
│       ├── 20240101000000_init_profiles.sql
│       └── 20240101000001_admin_functions.sql
├── scripts/make-first-admin.sql
├── tests/rls/rls.rls.test.ts   # RLS integration tests (staging)
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts  vitest.rls.config.ts
├── vercel.json
└── package.json
```

---

## 3. Tech stack

| Layer            | Choice                                                         |
| ---------------- | -------------------------------------------------------------- |
| UI               | React 18, TypeScript, Vite, Tailwind CSS                       |
| Routing          | React Router v7                                                |
| Forms            | React Hook Form + Zod                                          |
| Icons            | Lucide React                                                   |
| Auth             | Supabase Auth (email + password, PKCE)                         |
| Database         | Supabase PostgreSQL with Row Level Security                    |
| Tests            | Vitest + Testing Library (unit) / Vitest (RLS integration)     |
| Deployment       | Vercel (or any static HTTPS host)                              |

---

## 4. Prerequisites

- Node.js **20.19+ or 22.12+** (Vite 8 requirement)
- npm 10+
- A Supabase project (free tier is fine) — or the Supabase CLI for local development

---

## 5. Running locally

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env.local
#    then fill in the values (see §6)

# 3. Start the dev server
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + production build -> dist/
npm run preview      # preview the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (zero warnings allowed)
npm test             # unit tests
npm run test:rls     # RLS integration tests (needs staging creds)
```

---

## 6. Connecting Supabase

### 6.1 Create a project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Wait for provisioning to finish.

### 6.2 Get your keys (Settings → API)

Copy the **Project URL** and the **anon public** key into `.env.local`:

```dotenv
VITE_SUPABASE_URL="https://YOUR-PROJECT-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR-ANON-PUBLIC-KEY"
VITE_SITE_URL="http://localhost:5173"
```

> ⚠️ Never put the **`service_role`** key in the frontend or commit it. It must only ever be used by trusted server-side tooling.

### 6.3 Configure redirect URLs (Authentication → URL Configuration)

Set **Site URL** to your site, and add these **Redirect URLs**:

```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
https://YOUR-DOMAIN/auth/callback
https://YOUR-DOMAIN/reset-password
```

### 6.4 Authentication settings (Authentication → Providers → Email)

- **Confirm email**: ON (recommended). Users must verify their address before signing in.
- **Secure email change**: ON.
- Review **Authentication → Rate Limits** and tighten them for production.

### 6.5 Apply database migrations

**Option A — Supabase SQL editor (quickest):**
Paste the contents of, in order:
1. `supabase/migrations/20240101000000_init_profiles.sql`
2. `supabase/migrations/20240101000001_admin_functions.sql`

**Option B — Supabase CLI (recommended for teams):**

```bash
supabase link --project-ref YOUR-PROJECT-ref
supabase db push
```

The migrations create the `profiles` table, the signup trigger, RLS policies and the administrator RPC functions.

---

## 7. Creating the first administrator (safely)

There is deliberately **no** way to self-register as an admin.

1. Register a normal account through the app (`/register`) and confirm the email.
2. As a trusted operator, promote it using the SQL editor or CLI with
   `scripts/make-first-admin.sql` (edit the email first):

   ```sql
   update public.profiles
      set role = 'admin'
    where email = 'you@example.com';
   ```

3. Sign out and back in (or refresh) so the new role is loaded.
4. All subsequent role changes can be performed from **Admin → User Management**,
   which calls the server-authorised `admin_set_user_role` function.

---

## 8. Database model

`public.profiles` (1:1 with `auth.users`):

| Column       | Type          | Notes                                          |
| ------------ | ------------- | ---------------------------------------------- |
| `id`         | `uuid` PK/FK  | references `auth.users(id)` `on delete cascade` |
| `email`      | `text`        | mirror of the auth email                        |
| `full_name`  | `text`        | nullable, max 100 chars                         |
| `role`       | `user_role`   | enum `('user','admin')`, default `user`         |
| `created_at` | `timestamptz` | default `now()`                                 |
| `updated_at` | `timestamptz` | maintained by trigger                           |

### Row Level Security

- Users can **SELECT** only their own profile; admins can select all.
- Users can **UPDATE** only their own row and cannot change `role`.
- Column-level `UPDATE` grant limits writes to `full_name` only.
- No client `INSERT`/`DELETE` policies — rows are created by the signup trigger.
- `is_admin()` / `current_user_role()` are `SECURITY DEFINER`, avoiding recursive
  RLS evaluation.

### Administrator functions (server-authorised)

- `admin_users_page(search, role, verified, page, size)` → paginated user list.
- `admin_platform_stats()` → aggregate counts.
- `admin_set_user_role(target, role)` → change a role (cannot change own role).

Every one of these raises `insufficient_privilege` unless `is_admin()` is true.

---

## 9. Authentication features

- Email/password sign-in and sign-up (email confirmation supported).
- Password recovery: generic confirmation message, email link, token validation.
- Session persistence with a **Remember me** preference (localStorage vs sessionStorage).
- Automatic session refresh; expired sessions surface a clear re-auth prompt.
- Protected routes and administrator-only routes.
- Safe post-login / post-logout redirects (open-redirect protection).
- Login error messages never reveal whether an email is registered.

---

## 10. Testing

### Unit / component tests

```bash
npm test
```

Covers validation schemas, password evaluation, redirect safety, error mapping,
the "Remember me" storage adapter, and accessible UI components.

### RLS integration tests (run against a throwaway/staging project)

```bash
export SUPABASE_TEST_URL="https://YOUR-ref.supabase.co"
export SUPABASE_TEST_ANON_KEY="..."
export SUPABASE_TEST_SERVICE_ROLE_KEY="..."
npm run test:rls
```

These create real users and assert that:
- profiles are auto-created with role `user`;
- users can only read/update their own row;
- users cannot escalate their own role;
- non-admins are rejected by the admin RPCs;
- admins can list users/change roles;
- admins cannot change their own role.

> Without the environment variables the suite **skips** gracefully.

---

## 11. Deployment to Vercel

1. Push the repository to GitHub/GitLab.
2. In Vercel, **New Project → import the repo**. Vercel auto-detects Vite.
3. Add environment variables (Project → Settings → Environment Variables) for
   **Production** and **Preview**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (e.g. `https://your-domain.com`)
4. Deploy. The included `vercel.json` sets the SPA rewrite and security headers
   (CSP, HSTS, X-Frame-Options, etc.).
5. Add your production URLs to Supabase **Redirect URLs** (see §6.3).

---

## 12. Security checklist before production

- [ ] `service_role` key is **never** in the frontend bundle or git history.
- [ ] `.env.local` is git-ignored; only `.env.example` is committed.
- [ ] Email confirmation enabled in Supabase Auth.
- [ ] Auth **rate limits** reviewed and tightened.
- [ ] All redirect URLs are allow-listed in Supabase.
- [ ] RLS enabled on every client-accessible table (verified by `npm run test:rls`).
- [ ] Admin role changes only via `admin_set_user_role` / trusted SQL.
- [ ] HTTPS enforced (Vercel default) and HSTS header present.
- [ ] CSP and security headers active (see `vercel.json` / `index.html`).
- [ ] `npm audit --omit=dev` reports **zero** production vulnerabilities.
- [ ] No passwords, tokens, or reset links are logged.
- [ ] Least-privilege DB grants in place (column-level `UPDATE (full_name)`).
- [ ] Tested on mobile and desktop, keyboard-only navigation, reduced-motion.

> Known build-time advisories: the remaining `npm audit` findings are transitive
> dependencies of Tailwind's dev file-watcher (`braces`, via `chokidar`). They do
> not ship to the browser bundle, and no patched release exists upstream. They are
> accepted as development-only tooling risk.

---

## 13. Design system

Premium dark SaaS palette (see `tailwind.config.ts`):

| Token           | Value                     |
| --------------- | ------------------------- |
| Base background | `#0B0D12`                 |
| Sidebar         | `#0E1017`                 |
| Card            | `#141720`                 |
| Input           | `#11141C`                 |
| Primary indigo  | `#7779ED`                 |
| Accent lavender | `#A5A7FF`                 |
| Success         | `#70E2BD`                 |
| Error           | `#FF8998`                 |
| Text (primary)  | `#F0F1F8`                 |
| Text (secondary)| `#858B9F`                 |
| Border          | `rgba(255,255,255,0.08)`  |

Typography: **Manrope**. Interactions include hover/focus/loading/success/error/disabled states, subtle gradients, and `prefers-reduced-motion` support. Targets WCAG 2.2 AA (labelled inputs, visible focus rings, screen-reader alerts, adequate contrast).

---

## 14. License

Provided as a starting point for your own product. Add a license of your choice
before distributing.
