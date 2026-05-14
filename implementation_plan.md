# JivniCare Booking & Queue Flow - Implementation Plan

This document outlines the complete architectural plan and implementation sequence for the JivniCare V1 production-grade Booking & Queue Management system using MongoDB.

## 1. Booking Lifecycle Architecture

**Patient Journey:**
1. **Discovery:** Patient opens a Doctor's public profile (`/doctors/[id]`). The `BookingWidget` fetches real-time queue data (current active token, waiting count, est. wait time).
2. **Authentication:** Patient clicks "Join Queue". 
   - If not logged in, they are redirected to `/login?callbackUrl=/doctors/[id]`. 
   - Post-login, they return to the doctor's profile safely.
3. **Checkout/Confirmation:** Patient reviews the consultation fee and queue status. A checkout/payment modal or page confirms intent.
4. **Booking API:** Frontend calls `POST /api/patient/book-appointment`. 
5. **Confirmation:** On success, patient sees the "Booking Confirmed" screen with their exact Token Number and estimated wait time, which also appears in `/my-bookings`.

## 2. Queue/Token Flow

- **Single Source of Truth:** Both Online patients and Walk-in patients share the **exact same queue sequence** to prevent clinic chaos.
- **Sequential Generation:** Token numbers are generated strictly sequentially (1, 2, 3...) per doctor, per day.
- **Active Management:** 
  - The Doctor's `DailyQueue` tracks the `currentActiveToken`.
  - When the Doctor clicks "Next", the current token status becomes `COMPLETED`, and the next waiting token becomes `IN_CONSULTATION`.
  - "Skip" changes status to `SKIPPED` (patient can be called back later if needed).
  - "Emergency Insert" will add a patient with a special emergency flag to immediately bypass the standard waiting list.

## 3. Schema Structure (Prisma + MongoDB)

The system relies on three core models already present in our schema, with one minor proposed addition:
*   **`DailyQueue`**: Created automatically for a doctor on a specific day. Tracks `maxCapacity` and `currentActiveToken`.
*   **`QueueToken`**: The individual ticket. Tracks `tokenNumber`, `source` (ONLINE/WALK_IN), `status` (WAITING, IN_CONSULTATION, COMPLETED, SKIPPED, CANCELLED), and links to the Patient.
*   **`WalkInEntry`**: Stores name/phone for offline patients added by the receptionist/doctor.

## 4. Booking Validation Logic (Backend)

The `/api/patient/book-appointment` route runs a strictly isolated Prisma Transaction:
1.  **Auth Check:** Validates JWT for Patient role.
2.  **Date Parsing:** Locks the booking to the UTC Start-Of-Day.
3.  **Queue Limits Check:** Validates that `DailyQueue.tokens.count < DailyQueue.maxCapacity`.
4.  **Duplicate Check:** Verifies the `userId` does not already hold a `WAITING` or `IN_CONSULTATION` token for this specific `DailyQueue`.
5.  **Sequential Assignment:** Issues `nextTokenNumber = tokensCount + 1`.

## 5. Frontend & Backend Connection Plan

*   **Public API:** Create a new GET route `/api/public/doctor/[id]/queue-stats` so the `BookingWidget` can show live stats without needing authentication.
*   **Patient Dashboard:** The `/my-bookings` page will ping a user-specific API to get real-time updates on their waiting status (e.g., "5 patients ahead of you").
*   **Doctor Dashboard:** 
    *   The `/doctor/dashboard` UI will use `SWR` or `React Query` to poll `/api/doctor/queue` every 15 seconds.
    *   `NowCallingController` action buttons will trigger `PUT /api/doctor/queue/update-status`.
    *   `QueueOperationsMenu` will trigger `POST /api/doctor/queue/walk-in` (to create walk-ins) and `POST /api/doctor/queue/emergency`.

## 6. Safest Implementation Sequence

1.  **Phase 1: Backend Infrastructure (APIs & Schema)**
    *   Update `QueueToken` schema to add `isEmergency Boolean @default(false)` to handle emergency insertions cleanly.
    *   Create `/api/public/doctor/[id]/queue-stats` for the public booking widget.
    *   Create `/api/doctor/queue/walk-in` and `/api/doctor/queue/emergency` routes.
2.  **Phase 2: Patient Booking Experience (Frontend)**
    *   Connect `BookingWidget.tsx` to live stats.
    *   Implement the Join Queue / Checkout button to hit the real booking API.
    *   Build the Booking Confirmation UI.
3.  **Phase 3: Doctor Queue Control (Frontend)**
    *   Connect `NowCallingController` and `QueueOperationsMenu` in `doctor/dashboard` to the real APIs so the doctor can actually move the queue forward.
4.  **Phase 4: Real-time Feedback**
    *   Ensure the patient's `my-bookings` dashboard reflects the changes made by the doctor in real-time.

---

> [!IMPORTANT]
> **User Review Required:**
> 1. To support "Emergency Insert" cleanly without breaking the strict `tokenNumber` integer sequence, I propose adding `isEmergency Boolean @default(false)` to the `QueueToken` model. Emergency patients will automatically be sorted to the top of the "WAITING" list. Do you approve this minor schema update?
> 2. Currently, the `BookingWidget` has an "In-Clinic" vs "Video Call" selector. Should the queue system handle BOTH together, or should this V1 focus purely on physical/In-Clinic queue management?
