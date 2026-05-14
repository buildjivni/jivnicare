# JivniCare Doctor System - End-to-End Workflow Audit

**Date:** May 15, 2026
**Target Architecture:** Doctor Onboarding, Routing, Dashboard, and Queue Management
**Auditor:** Lead Healthcare SaaS Architect

## Executive Summary
This document provides a deep, evidence-based audit of the JivniCare Doctor System workflow. The investigation reveals a critical architectural gap: **The doctor onboarding UI is completely disconnected from the backend database.** Form data is discarded upon completion, no session is created, and the dashboard redirect fails because no doctor profile actually exists in the database. Furthermore, the Live Queue system lacks transactional safety and relies on slow 30-second HTTP polling rather than real-time WebSockets, which is unsuitable for a fast-paced clinical environment.

---

## 1. Doctor Onboarding & Profile Creation Audit

| ID | Module | Issue Found | Root Cause | Severity | Impact | Risk Level | Recommended Solution | Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| ONB-01 | `partners/onboard` | Complete Data Loss on Submit | The 5-step React form (`formData`) has no `fetch` or `axios` call hooked to the `Submit` button. State is lost on unmount. | Critical | Doctors cannot register. 100% drop-off rate. | Production Blocking | Create `POST /api/doctor/onboard` API. Map form data to Prisma `Doctor` & `User` models, and save it. | High | Pending Discussion |
| ONB-02 | `partners/onboard` | Missing Session Creation | Because there is no backend call, no JWT cookie is issued and the `useAuthStore` is never updated with the `DOCTOR` role. | Critical | The system does not recognize the user as a logged-in doctor. | Production Blocking | Return JWT token on successful onboarding and set strict HTTP-only cookies + Zustand state. | Medium | Pending Discussion |
| ONB-03 | `partners/onboard` | Broken Redirect Logic | Step 5 hardcodes `<Link href="/">` (Homepage) instead of redirecting to the Doctor Dashboard. | High | Confusing UX; the doctor is abandoned at the homepage without instructions. | Major | Redirect successfully onboarded doctors to `/doctor/dashboard`. | Low | Pending Discussion |

---

## 2. Redirect, Navigation & Middleware Audit

| ID | Module | Issue Found | Root Cause | Severity | Impact | Risk Level | Recommended Solution | Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| NAV-01 | `middleware.ts` | Frontend Routes Unprotected | `matcher` only protects `/api/doctor/*`, completely ignoring `/doctor/*` frontend routes. | High | Unauthenticated users can navigate directly to the Doctor Dashboard UI, which then silently crashes/blanks when APIs fail with 401s. | Major | Add `/doctor/:path*` to `middleware.ts` matcher or implement a strict frontend auth boundary/HOC. | Medium | Pending Discussion |
| NAV-02 | `doctor/dashboard` | Unhandled 401 Errors | The `fetchQueue` function suppresses errors (`catch (err) {}`) when `/api/doctor/queue` returns a 401 Unauthorized. | Medium | Infinite empty state shown instead of redirecting the user back to `/login`. | Moderate | Implement `axios` interceptors or global error handling to force redirect on 401 responses. | Low | Pending Discussion |

---

## 3. Queue Management & Realtime Sync Audit

| ID | Module | Issue Found | Root Cause | Severity | Impact | Risk Level | Recommended Solution | Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| Q-01 | `api/doctor/queue` | Race Conditions in Queue Updates | `update-status` API does not use Prisma `$transaction`. | High | If a receptionist and a doctor click "Next Patient" simultaneously, two tokens could be marked as `IN_CONSULTATION`. | Major | Wrap token status update and `currentActiveToken` update in a strict Prisma `$transaction`. | Medium | Pending Discussion |
| Q-02 | `doctor/dashboard` | Suboptimal "Realtime" Sync | The dashboard uses `setInterval(fetchQueue, 30000)` (30 seconds polling) to get queue updates. | Medium | 30s delay is too slow for physical walk-in clinics. Doctors will see stale queue data. | Moderate | Implement Pusher, Socket.io, or at least Server-Sent Events (SSE) for instant queue updates. | High | Pending Discussion |
| Q-03 | `api/doctor/queue` | Missing Queue Initialization | The `GET` queue route expects a `DailyQueue` to exist, but there is no scheduled Cron Job or API to automatically generate the `DailyQueue` for the day. | High | First patient of the day cannot book an appointment until the queue is manually initialized. | Major | Implement lazy initialization: if `DailyQueue` doesn't exist for `today`, create it instantly during the GET or Book request. | Medium | Pending Discussion |

---

## 4. UI/UX Flow & State Management Audit

| ID | Module | Issue Found | Root Cause | Severity | Impact | Risk Level | Recommended Solution | Complexity | Status |
|---|---|---|---|---|---|---|---|---|---|
| UX-01 | `doctor/dashboard` | Static Mock Profile Fallbacks | Variables like `profileData` are initialized with `"Dr. Sanctuary"` statically instead of utilizing real JWT/Prisma data. | Medium | Once logged in, the dashboard still shows fake name/bio instead of the actual doctor's data. | Major | Create `GET /api/doctor/profile` and hydrate dashboard state on mount. | Medium | Pending Discussion |
| UX-02 | `doctor/dashboard` | "Mark Holiday" State is Ephemeral | `leaveMode` is a local React state (`useState(false)`). | Medium | Clicking "Mark Clinic Closed" doesn't actually update the database (`ClinicOperations`). Refreshing the page reverts it. | Major | Hook the toggle to a `PUT /api/doctor/settings` endpoint. | Low | Pending Discussion |

---

## Final Output & Risk Scoring

### Scores
* **Doctor Workflow Health Score:** 20/100 *(Currently disconnected and non-functional)*
* **Queue Reliability Score:** 60/100 *(Logic works but lacks transactional safety & realtime sync)*
* **Dashboard Stability Score:** 40/100 *(Unprotected routes, unhandled API errors)*
* **Data Integrity Score:** 50/100 *(No onboarding data is actually saved)*
* **Authentication Reliability Score:** 70/100 *(JWT is secure, but middleware coverage is incomplete)*

### Top 5 Critical Issues
1. **[ONB-01]** No backend connection for Doctor Onboarding (100% data loss).
2. **[ONB-02]** No session/JWT creation during the onboarding flow.
3. **[NAV-01]** Middleware does not protect the Doctor Dashboard frontend route.
4. **[Q-01]** No database transactions on live queue operations, risking data corruption.
5. **[Q-03]** Missing automatic initialization of the `DailyQueue` for new working days.

### Recommended Fix Priority Order (Safe Refactoring Plan)
1. **Phase 1 (The Core Blockers):** Build `POST /api/doctor/onboard`. It must validate input, hash passwords, create `User` (Role: DOCTOR), create `Doctor` profile, set `httpOnly` JWT cookies, and return success. Update the UI to call this API on Step 4 and redirect to `/doctor/dashboard` on Step 5.
2. **Phase 2 (Navigation Security):** Expand `middleware.ts` to protect `/doctor/*` and `/admin/*` frontend routes, instantly redirecting unauthenticated users to `/login`.
3. **Phase 3 (Dashboard Hydration):** Create `/api/doctor/profile` and `/api/doctor/settings` to fetch and update real database values instead of the current hardcoded static states in the Dashboard.
4. **Phase 4 (Queue Hardening):** Implement Prisma `$transaction` blocks in `update-status`, and lazy-initialize `DailyQueue` objects when fetching if they don't exist yet for the current date.

**Note: No code has been modified during this audit.** 
Please review the findings and let me know if you approve executing **Phase 1** (The Core Blockers) to connect the Onboarding UI to a real backend.
