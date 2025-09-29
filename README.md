## Clerk Auth — Signup, Signin, Signout (Project-Specific)

This repo uses Clerk email/password auth with custom pages and a webhook to persist users in Prisma. No Google/SSO, no NextAuth.

### Env (in `.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_SIGN_IN_URL=/signin
CLERK_SIGN_UP_URL=/signup
WEBHOOK_SECRET=whsec_...
DATABASE_URL="file:./dev.db"
```

### Prisma

```bash
pnpx prisma migrate dev
pnpx prisma generate
```

### What’s implemented (matching codebase)

- `src/app/layout.tsx`: wraps app in `ClerkProvider`
- `src/middleware.ts`: protects routes; redirects unauthenticated users to `/signin`, authed users away from `/`, `/signin`, `/signup` to `/dashboard`
- `src/app/(auth)/signup/page.tsx`: email/password signup, role selection, email code verification
- `src/app/(auth)/signin/page.tsx`: email/password signin
- `src/app/api/check-email/route.ts`: pre-check if email exists in DB
- `src/app/api/webhook/register/route.ts`: handles `user.created`, persists user + role to Prisma (via Svix)
- `src/app/(app)/dashboard/page.tsx`: example protected page

### How to use

- Go to `/signup`, complete form, verify email code → redirected to `/dashboard`
- Go to `/signin` to sign in
- Sign out: use `<UserButton />` or `useClerk().signOut()` in a client component

### Notes

- Roles are set via `unsafeMetadata.role` on signup and stored in DB by the webhook
- Public routes: `/`, `/signin`, `/signup`, `/error`, `/api/webhook/register`



