# JivniCare Deployment & Operational Discipline

Healthcare systems require extreme operational caution. At this phase, **RELIABILITY > FEATURES**. 
Users will tolerate missing features, but they will never tolerate broken queues, lost bookings, or authentication failures.

This document outlines the strict deployment, rollback, and environment discipline required to maintain operational trust.

---

## 1. Staging vs Production Discipline

We maintain a strict separation between environments.

**Environment Isolation Rules:**
- **NEVER** enable test OTP variables (`NEXT_PUBLIC_ENABLE_TEST_OTP`) in the production environment.
- **NEVER** deploy staging secrets (like staging DB URLs or staging API keys) to production.
- **NEVER** expose server secrets to `NEXT_PUBLIC_` prefixed variables.

*If test auth leaks into production, it fundamentally breaks healthcare trust by allowing bypasses.*

---

## 2. Stop-Deploy Conditions

**DO NOT DEPLOY IF any of the following conditions exist:**
- Booking CTA instability (e.g., duplicate CTAs, unclickable buttons).
- Queue reconnect instability (SSE fails to recover after mobile backgrounding).
- Auth loops or infinite loading states.
- Hydration mismatches remain unresolved.
- Core E2E suite (`npm run e2e:core`) is failing.
- OTP delivery is inconsistent.
- Queue state desync is unresolved.
- Telemetry or Error Boundaries are exposing sensitive data or stack traces.

*Fix operational trust FIRST before expanding features.*

---

## 3. Deployment Freeze Rules

Avoid deploying to production during high-risk windows:
- During active clinical testing sessions or live doctor usage.
- During active peak queue usage (e.g., busy morning/evening clinic hours).
- If staging validation is unstable or inconclusive.
- Late at night or during fatigue windows where rollback response times would be delayed.

---

## 4. Pre-Deployment Checklist

Before pressing deploy (or pushing to the `main` branch), you **MUST** run the validation pipeline:

```bash
npm run validate-deploy
```

This runs:
1. `npm run lint` (ESLint checks)
2. `tsc --noEmit` (Strict TypeScript checks)
3. `npm run build` (Next.js production build check)
4. `npm run e2e:core` (Playwright tests for Patient Journey, Doctor Journey, and Navigation)

---

## 5. Post-Deployment Validation

Immediately after a successful deployment, manually validate the following on the live URL:

1. **OTP Login:** Can a real user log in? Is the session persisted?
2. **Booking Flow:** Does the checkout funnel work? Are errors handled gracefully?
3. **Queue Updates:** Does the doctor dashboard update when a patient joins?
4. **Emergency Flow:** Can an admin/doctor override the queue for an emergency?
5. **Reconnect Recovery:** Open the app on Android Chrome, lock the phone for 1 minute, unlock, and verify the queue resyncs instantly.
6. **Telemetry Visibility:** Check `/admin/dashboard/telemetry` to ensure no spikes in 500s or crashes.

---

## 6. Rollback Instructions

If a deployment introduces critical instability (see Stop-Deploy conditions), **ROLLBACK IMMEDIATELY**. Do not attempt to "hotfix forward" if the queue or booking systems are impacted.

**Vercel Rollback Process:**
1. Navigate to the project dashboard on Vercel.
2. Go to **Deployments**.
3. Find the last known stable deployment.
4. Click the three dots (⋮) and select **Instant Rollback**.
5. Assign the domain to the previous deployment.
6. Post-mortem the failure in a staging environment.

---

## 7. Backup Awareness & Database Safety

**Keep it lightweight. Simple, repeatable recovery is enough.**
- **Creation:** Daily automated backups must be configured on the database provider (e.g., Vercel Postgres/Supabase PITR).
- **Storage:** Backups must be retained by the cloud provider securely for at least 7 days.
- **Restore:** Document your cloud provider's 1-click restore procedure. Ensure you know exactly who has the authorization to trigger a restore.

---

## 8. Prisma Migration Discipline

Before ANY schema migration (`prisma db push` or `prisma migrate deploy`), adhere to the following:
1. **Backup First:** Verify a recent backup exists.
2. **Validate on Staging:** Run the migration on the staging database first.
3. **Verify Integrity:** After migration, verify that existing queue flows and booking histories remain intact. Queue and booking tables are state-sensitive.
