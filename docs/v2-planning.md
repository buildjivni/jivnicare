# JivniCare V2 Planning & Deferrals

This document outlines the features and architectural changes deferred from the V1 Master UI/UX Overhaul to JivniCare V2.

---

## 📋 Deferrals

### 1. Admin-Initiated Doctor Onboarding
*   **V1 Approach:** Doctor self-registration via the public partner onboarding forms (`/partners/onboard`) is the sole registration flow. The direct admin-initiated doctor creation and onboarding workflow inside the Admin Dashboard is deferred to V2 (there is no "+ Add Doctor" action or API). Admins manage onboarded doctors by approving/rejecting their pending applications in the Admin Dashboard.
*   **V2 Deferral:** The direct admin-initiated doctor creation and credential setup workflow inside the Admin Dashboard is deferred to V2.

### 2. Intermediate Activation States
*   **V1 Approach:** Transitioning verified doctors through custom activation sub-states is deferred. Admin approval instantly changes verification status to `VERIFIED` and sets `canShowOnPublic = true`.
*   **V2 Deferral:** Granular post-verification activation states (e.g. pending first credentials setup, training status) are deferred to V2.

### 3. Waitlist Slot Allocation (Auto-booking with timeouts)
*   **V1 Approach:** V1 implements the **Broadcast + First-Claim** pattern (2N notification, manual claim, atomic first-come-first-served check) rather than auto-booking. When a slot opens, the top 2 waitlisted entries are notified and must manually claim the slot. The first to claim gets the booking; the slower claimant's waitlist status is reset to `notified: false` so they are notified on subsequent openings.
*   **V2 Deferral:** Fully automated FIFO auto-booking with individual timeout reservation windows (e.g. 5-minute hold times) is deferred to V2.

---

## 🔒 Onboarding Status Safeguards (V1)
Newly created doctor profiles are subject to the following automated safeguards to prevent premature public listing or booking capability:
1.  **Default Status:** All new doctor profiles are created with `verificationStatus` defaulting to `PENDING_ACTIVATION` (Step 1) and progress to `PENDING_REVIEW` upon completion of Step 4.
2.  **Public Visibility Lock:** The database field `canShowOnPublic` is defaulted to `false` and cannot be modified by the doctor profile owner.
3.  **Booking Restrictions:** The database field `isAcceptingBookings` is defaulted to `false`.
4.  **Admin Verification Requirement:** The public search API filters solely for `canShowOnPublic: true` and `verificationStatus: VERIFIED`. Doctors can only go live after an admin explicitly verifies them in the Admin Dashboard (triggering verification actions that set `verificationStatus: VERIFIED` and `canShowOnPublic: true`).

