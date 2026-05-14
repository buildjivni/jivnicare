# JivniCare Platform - System Architecture Audit

**Date:** May 14, 2026
**Auditor:** Lead Systems Architect

## Executive Summary
This document provides a comprehensive, evidence-based system audit of the JivniCare platform. The platform exhibits a solid foundational architecture with Next.js App Router and Prisma, but currently contains significant technical debt, security loopholes, and severe scalability bottlenecks that prevent it from being production-ready at scale.

---

## 1. Authentication & Security Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| SEC-01 | State Management (`useAuthStore.ts`) | JWT token stored in `localStorage` | Critical | Zustand `persist` middleware configured to serialize `token` state to local storage. | Highly vulnerable to Cross-Site Scripting (XSS) attacks. Attackers can steal tokens and hijack sessions. | Remove `token` from `partialize` filter. Rely strictly on `httpOnly` secure cookies. | Production Blocking | Low | Pending Discussion |
| SEC-02 | Edge Middleware (`middleware.ts`) | Missing CSRF Protection | High | API routes protected by cookie-based JWT lack Cross-Site Request Forgery (CSRF) tokens. | Malicious sites could force authenticated users to execute unwanted actions (e.g., booking/deleting). | Implement a CSRF token header check or `SameSite=Strict` cookie policy. | Major | Medium | Pending Discussion |
| SEC-03 | Auth API (`verify-otp`) | Missing Rate Limiting on Login | High | OTP verification endpoint accepts infinite requests. | Brute-force attacks can overwhelm the database or bypass OTP security. | Implement Upstash/Redis rate limiting (e.g., max 5 attempts/minute per IP). | Major | Low | Pending Discussion |

---

## 2. Backend & Scalability Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| SCL-01 | Search API (`api/public/search`) | In-Memory Array Filtering (O(N) bottleneck) | Critical | API fetches *all* `VERIFIED` doctors via Prisma `findMany()`, maps them, and filters/searches in memory. | As the doctor database grows >1,000 records, API will crash due to Node.js memory exhaustion and Vercel execution timeouts. | Shift filtering entirely to Prisma queries (e.g., `where: { specialties: { hasSome: [...] }, name: { contains: ... } }`). | Production Blocking | Medium | Pending Discussion |
| SCL-02 | Search API (`api/public/search`) | Hardcoded Data Mocking | Medium | API maps DB data to UI type but hardcodes missing fields (e.g., `rating: 4.5`, `reviews: 120`, `bgImage`). | UI displays fake trust metrics for real doctors. | Update Prisma schema to support reviews/ratings and fetch real aggregates. | Moderate | Medium | Pending Discussion |

---

## 3. Database Architecture Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| DB-01 | Prisma Schema (`schema.prisma`) | Anti-Pattern: Array of Strings for Relations | Medium | `Specialty` and `Keyword` models link to `Doctor` using `doctorIds String[]` instead of explicit join tables. | Difficult to run fast relational aggregation queries or enforce strict referential integrity. | Refactor to implicit/explicit many-to-many relationship using Prisma's standard relation syntax. | Minor | High | Pending Discussion |
| DB-02 | Queue System (`QueueToken`) | Missing Optimistic Concurrency Control | High | Tokens are issued sequentially without `@updatedAt` versioning or pessimistic locks in `issueToken`. | Under heavy load (10 users booking the same slot), race conditions could issue duplicate token numbers. | Implement `$transaction` with optimistic locking or sequential atomic increments. | Major | Medium | Pending Discussion |

---

## 4. Frontend & UX Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| FE-01 | Homepage UI (`app/(public)`) | Total Reliance on `mock-data.ts` | Critical | `SpecialtiesSection.tsx` and `AvailableDoctorsSection.tsx` directly import static mock arrays. | The homepage is entirely disconnected from the database. It displays fake specialties and doctors. | Fetch data from `api/public/search` or server components directly via Prisma. | Production Blocking | Low | Pending Discussion |
| FE-02 | Patient Dashboard (`my-bookings`) | Missing Error Boundary State | Medium | Failed fetch catches error but displays "No bookings yet" instead of an error UI. | Confuses patients if the database goes down, making them think their booking was cancelled. | Implement `error.tsx` or a distinct `isError` boolean in the component state. | Moderate | Low | Pending Discussion |

---

## 5. Architecture Consistency Audit

| ID | Module | Issue Found | Severity | Root Cause | Impact | Recommended Fix | Risk Level | Implementation Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| ARC-01 | Types & Interfaces (`src/types`) | Mismatched Contracts | High | The frontend `Doctor` type (used by UI cards) does not natively match the Prisma `Doctor` model structure. | Forces heavy data transformation in every API route, increasing API latency. | Align frontend UI components to accept the exact payload structure returned by Prisma. | Moderate | High | Pending Discussion |

---

## Final Output & Risk Scoring

### Scores
* **System Health Score:** 65/100
* **Production Readiness Score:** 40/100 *(Blocked by SCL-01 & FE-01)*
* **Security Score:** 50/100 *(Blocked by SEC-01 & SEC-02)*
* **Scalability Score:** 30/100 *(Blocked by SCL-01)*
* **Maintainability Score:** 80/100

### Top Critical Risks (Production Blocking)
1. **SCL-01**: `api/public/search` fetching all DB records into server RAM before filtering.
2. **SEC-01**: Storing sensitive JWT Auth tokens in `localStorage`.
3. **FE-01**: Homepage strictly bound to hardcoded `mock-data.ts` instead of live MongoDB.

### Recommended Next Implementation Order (Safe Refactoring Roadmap)
1. **[URGENT] Resolve FE-01:** Refactor Homepage to use live database data (allows safe deletion of `mock-data.ts`).
2. **[URGENT] Resolve SCL-01:** Refactor Search API to use strict Prisma `where` clauses instead of in-memory array filtering.
3. **[SECURITY] Resolve SEC-01:** Remove JWT persistence from `useAuthStore.ts` and rely strictly on Next.js API Cookie extraction.
4. **[STABILITY] Resolve DB-02:** Add Prisma transactions (`$transaction`) to the Queue booking system to prevent token race conditions.
