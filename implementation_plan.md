# System Remediation Plan

This plan addresses the **top critical problems** identified in the JivniCare system audit to prepare the platform for production launch.

## Proposed Changes

We will tackle the fixes in three main phases:

### Phase 1: Edge Security & Middleware

Currently, `src/middleware.ts` is empty. We will secure all API routes.

#### [NEW] `npm install jose`
- Since `jsonwebtoken` does not work in Next.js Edge Runtime (used by Middleware), we need the standard `jose` package.

#### [MODIFY] `src/middleware.ts`
- Implement Edge middleware to intercept requests to `/api/admin/*`, `/api/doctor/*`, and `/api/patient/*`.
- Verify the `auth-token` cookie using `jose`.
- Enforce Role-Based Access Control (RBAC):
  - Block patients from `/api/admin` and `/api/doctor`
  - Return `401 Unauthorized` or `403 Forbidden` standard JSON responses instead of crashing or relying on the client UI.

### Phase 2: Migrate Search Engine to Backend (Scalability Fix)

Currently, the client browser downloads `mock-data.ts` and runs fuzzy matching locally. We will move this to the server to prevent browser crashes and bundle bloat.

#### [NEW] `src/app/api/public/search/route.ts`
- Create an API endpoint that accepts `?q=query` and `?specialty=specialty`.
- Fetch active, verified doctors from MongoDB via Prisma.
- Pass the DB data through our robust `searchDoctors` algorithm from `search-engine.ts`.
- Return the `SearchResult` JSON.

#### [MODIFY] `src/lib/search-engine.ts`
- Disconnect `mock-data.ts` from the search engine.
- Update types to strictly map with `Prisma.DoctorGetPayload`.

#### [MODIFY] `src/app/(public)/doctors/page.tsx`
- Replace client-side local arrays with a `useEffect` / `fetch` call to `/api/public/search`.
- Implement a loading skeleton while the server fetches and computes the search results.

### Phase 3: Technical Debt & Stability

#### [MODIFY] `src/data/mock-data.ts`
- Safely deprecate/isolate mock data so it doesn't accidentally end up in the client production bundle.

#### [MODIFY] `src/components/shared/RoleGuard.tsx`
- Optimize hydration checks to minimize the "flash of loading spinner" for authenticated users.

---

> [!WARNING]
> **User Review Required**
> Do you approve installing the `jose` package to handle JWT verification in the Edge Middleware? 
> `jsonwebtoken` is inherently incompatible with Vercel's Edge architecture.

## Verification Plan
1. **Security:** Attempt to curl `/api/admin/doctors` without a token and verify a `401` response.
2. **Search Performance:** Inspect the network tab on `/doctors` to confirm `mock-data.js` is no longer bundled, and an API call is made to `/api/public/search`.
3. **End-to-End:** Search for "bukhar", ensure the backend returns the correct Doctor results.
