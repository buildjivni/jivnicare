# JivniCare V2 Planning & Deferrals

This document outlines the features and architectural changes deferred from the V1 Master UI/UX Overhaul to JivniCare V2.

---

## 📋 Deferrals

### 1. Admin Onboarding (Doctor Creation Flow)
*   **V1 Approach:** Doctor self-registration via the public partner onboarding forms is fully sufficient. Admins can verify doctors through the Admin Dashboard by approving their pending status.
*   **V2 Deferral:** The direct admin-initiated doctor creation and onboarding workflow inside the Admin Dashboard is deferred to V2.

### 2. `PENDING_ACTIVATION` Doctor Status
*   **V1 Approach:** Newly onboarded doctors are created with `DRAFT` or `PENDING_REVIEW` verification status. Approved doctors immediately change to `APPROVED` / `VERIFIED`.
*   **V2 Deferral:** The intermediate `PENDING_ACTIVATION` status (signaling verified credentials but pending first login / setup) is deferred to V2 and handled by `PENDING_REVIEW` in V1.
