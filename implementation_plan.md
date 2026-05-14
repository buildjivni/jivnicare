# Phase 5 Implementation Plan: Patient Booking & Search Flow

With the Doctor module fully operational and hardened against concurrency (Phases 1-4), the next critical pillar of the platform is the **Patient Journey**. We need to ensure patients can seamlessly search for doctors and securely book themselves into the live queue.

## Proposed Changes

### 1. Search & Discovery Hardening
#### [MODIFY] `src/app/api/public/search/route.ts`
- **Current State:** Likely using static mocks or unoptimized database queries.
- **Action:** Refactor the endpoint to perform robust MongoDB full-text searches against the `Doctor` model.
- Filter only `VERIFIED` doctors.
- Include nested `Specialties` and `Keywords` matching.
- Optimize query performance using Prisma `select`.

### 2. Patient Booking & Queue Integration
#### [MODIFY] `src/app/api/patient/book-appointment/route.ts`
- **Current State:** Needs to securely interface with the `DailyQueue` we just hardened.
- **Action:** Implement a strict booking transaction:
  - Verify patient auth token.
  - Locate or lazy-initialize the target doctor's `DailyQueue` for the requested date.
  - Check capacity (`currentCapacity < maxCapacity`).
  - **Prisma `$transaction`:** Create the `QueueToken` and increment the `DailyQueue` capacity atomically to prevent overbooking.

### 3. Patient Dashboard Hydration
#### [MODIFY] `src/app/api/patient/my-bookings/route.ts`
#### [MODIFY] `src/app/my-bookings/page.tsx` (or equivalent patient dashboard)
- Create/Update the API to fetch all `QueueToken` entries linked to the patient's `userId`.
- Hydrate the patient UI so they can see their live queue status, estimated time, and token number.

## Open Questions

> [!WARNING]  
> Are we handling **Payments** during the booking flow right now, or should the appointment booking be free/pay-at-clinic for this phase?

## User Review Required

> [!IMPORTANT]  
> This phase will completely connect the Public/Patient side to the Doctor's Live Queue. If you approve this plan, we will proceed with the execution.
