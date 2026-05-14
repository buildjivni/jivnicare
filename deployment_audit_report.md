# JivniCare Platform - Production Deployment Audit

**Date:** May 14, 2026
**Target Infrastructure:** Vercel (Edge + Serverless) with MongoDB
**Auditor:** Lead DevOps & Cloud Architect

## Executive Summary
This document provides a rigorous, end-to-end technical audit of the JivniCare platform, specifically analyzing its readiness for a production-grade deployment on Vercel with a custom domain. The platform is structurally sound but requires specific configurations to ensure secure HTTPS routing, scalable database connections, and Vercel Edge compatibility before live user traffic is directed to the custom domain.

---

## 1. Vercel Configuration & Routing Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| DPL-01 | `vercel.json` | Missing Cache Headers & Rewrites | Medium | Basic Vercel config only includes basic security headers. Missing stale-while-revalidate caching rules for static assets. | Suboptimal CDN caching leading to slower page loads and higher Vercel bandwidth usage. | Add `Cache-Control` headers for `/_next/static/*` and public assets in `vercel.json`. | Minor | Low | Pending Discussion |
| DPL-02 | `next.config.ts` | Over-permissive Image Domains | High | `remotePatterns` allows any path from domains like `images.unsplash.com`. | Potential abuse of Next.js Image Optimization API leading to Vercel billing spikes (Image Optimization quota limits). | Lock down remote patterns to specific trusted paths or enforce strict width/quality limits. | Moderate | Low | Pending Discussion |
| DPL-03 | Domain | Missing Canonical URL Config | Medium | Base URL is not strictly enforced in Next.js metadata. | If custom domain is connected, Vercel `.vercel.app` domain might also index, causing SEO duplicate content penalties. | Enforce `metadataBase` in `layout.tsx` pointing to the exact custom production domain. | Minor | Low | Pending Discussion |

---

## 2. Database & Connection Pooling Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| DB-03 | `prisma.ts` | Missing Edge Compatibility for Prisma | High | Next.js Middleware runs on the Vercel Edge network, but Prisma Client cannot run natively on Edge without Prisma Accelerate. | If `prisma` is ever imported into `middleware.ts`, the Vercel deployment will crash at runtime. | Ensure `middleware.ts` only relies on `jose` for JWT validation, never importing `prisma`. Document this strictly. | Major | Low | Pending Discussion |
| DB-04 | Database | MongoDB Connection Limits | High | Serverless functions spin up rapidly. Prisma default config without `connection_limit` can exhaust MongoDB connections. | "Too many connections" errors from MongoDB Atlas during traffic spikes. | Add `?maxPoolSize=10` to the MongoDB `DATABASE_URL` specifically for serverless deployment. | Major | Low | Pending Discussion |

---

## 3. Environment Variables & Secrets Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| ENV-01 | API Routes | Missing Environment Fallbacks | High | API routes depend on `NEXT_PUBLIC_API_URL` which is brittle for internal Vercel server-to-server fetches. | Vercel deployments might fail to fetch local APIs during build time if the URL is not dynamically resolved. | For internal fetches, use relative paths or detect Vercel's `VERCEL_URL` system environment variable automatically. | Major | Medium | Pending Discussion |
| ENV-02 | Security | Weak JWT Secret Handling | Critical | `jwtVerify` relies on `process.env.JWT_SECRET`. If missing, it crashes or fallback is unsafe. | Authentication failure across the entire app if env var is mistyped in Vercel dashboard. | Enforce startup check for `JWT_SECRET` in `next.config.ts` or a dedicated boot script, failing the build explicitly. | Production Blocking | Low | Pending Discussion |

---

## 4. Security & Healthcare Compliance Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| SEC-04 | API Endpoints | Missing Rate Limiting for Public APIs | High | Vercel Edge Network does not rate-limit API routes natively. `/api/patient/book-appointment` is exposed. | Malicious bots could spam the booking queue, taking all available doctor tokens. | Implement `@upstash/ratelimit` on the Vercel Edge for booking and OTP endpoints. | Production Blocking | Medium | Pending Discussion |
| SEC-05 | Cookies | Missing `Secure` and `SameSite` flags | Critical | Local storage migration to cookies (pending from previous audit) must ensure Vercel production flags. | Tokens can be hijacked via Man-in-the-Middle if sent over non-HTTPS or cross-site. | Enforce `Secure: process.env.NODE_ENV === 'production'` and `SameSite: 'strict'` on all auth cookies. | Major | Low | Pending Discussion |

---

## Final Output & Risk Scoring

### Scores
* **System Health Score:** 70/100
* **Production Readiness Score:** 50/100 *(Blocked by Rate Limiting & Connection Pooling)*
* **Security Score:** 55/100 *(Blocked by Rate Limiting and Cookie Flags)*
* **Scalability Score:** 85/100 *(Significantly improved after previous search optimization, but DB connection pooling needs setting).*
* **Maintainability Score:** 80/100

### Top 10 Critical Risks
1. **[SEC-04]** No rate-limiting on booking/OTP endpoints (Bot abuse risk).
2. **[SEC-01]** (From previous audit) JWT token still in localStorage instead of strict cookies.
3. **[ENV-02]** Missing hard build-time validation for critical secrets.
4. **[DB-04]** MongoDB connection exhaustion during serverless cold starts.
5. **[SEC-05]** Insecure cookie flag handling if migrating from localStorage.
6. **[ENV-01]** Hardcoded absolute URLs for internal API calls instead of relative paths.
7. **[DPL-02]** Over-permissive Next.js Image optimization domains.
8. **[FE-01]** `mock-data.ts` still present in `SmartSearchBar` and some subpages.
9. **[DPL-03]** Missing `metadataBase` leading to duplicate SEO indexing between `.vercel.app` and Custom Domain.
10. **[DPL-01]** Missing strict CDN caching rules in `vercel.json`.

### Recommended Next Implementation Order (Safe Vercel Roadmap)
1. **[URGENT SECURITY] SEC-01 & SEC-05**: Move Authentication state strictly to `httpOnly, Secure, SameSite=Strict` cookies to ensure healthcare-grade session security.
2. **[URGENT INFRA] DB-04 & ENV-02**: Validate Vercel Environment Variables and enforce MongoDB `maxPoolSize`.
3. **[URGENT PROTECT] SEC-04**: Implement basic Edge Rate Limiting or middleware restrictions for booking APIs.
4. **[DOMAIN PREP] DPL-03**: Configure `metadataBase` in `layout.tsx` to strictly point to the chosen Custom Domain.
