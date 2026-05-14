# Doctor / Partner Onboarding Architecture & Workflow

## Overview
This document outlines the professional, trust-based onboarding workflow for Doctors and Partners on the JivniCare platform. The workflow is strictly separated from the patient experience to maintain an operational, verification-oriented standard.

## 1. Entry Flow & Role-Based Routing
- **Entry Point:** The primary entry point is located in the footer of the public JivniCare website under a clearly visible "For Partner" link/button.
- **Action:** Clicking "For Partner" presents two options: `Login` and `Create Account`.
- **Role Isolation & Routing:**
  - The Doctor onboarding flow must be completely segregated from the Patient flow at the route level.
  - Upon successful login or registration completion, Doctors are routed exclusively to the `/doctor/dashboard`.
  - Authenticated doctors must not be shown the patient homepage or patient-specific interfaces.

## 2. Onboarding Logic (Multi-Step Creation Flow)
The "Create Account" process is a structured, multi-step wizard designed to gather operational and professional details cleanly without overwhelming the user.

### Step 1: Basic Details
**Purpose:** Establish initial identity, follow-up communication, and verification basis.

**Data Collected:**
- Full Name
- Mobile Number
- Email Address

**Validation Strategy (Strict Client & Server Validation):**
- *Full Name:* Must reject numeric-only input.
- *Mobile Number:* Must reject alphabetical characters; strictly enforce numeric/phone format.
- *Email:* Standard email pattern validation.
- *State:* The "Save & Next" action must be blocked until all frontend validations pass.

### Step 2: Professional Doctor Details
**Purpose:** Collect critical professional data that empowers patients to confidently select a doctor.

**Data Collected:**
- Specialization & Qualification
- Experience (Years)
- Consultation Fee & Consultation Type
- Languages Spoken
- About Doctor (Professional Bio)
- Availability

**Data Grouping Strategy:**
Group these fields into a `ProfessionalProfile` schema. This data is the primary index for the patient search engine.

### Step 3: Hospital / Clinic Details
**Purpose:** Capture operational and location-based information for the doctor's physical or primary practice.

**Data Collected:**
- Hospital/Clinic Name & Address
- Location (City, Coordinates/Map Data)
- Timings & Working Days
- Operational Contact Information

**Data Grouping Strategy:**
Group into a `ClinicProfile` schema, allowing future scalability where a doctor might operate out of multiple clinics.

## 3. Admin Moderation & Verification Flow
**Purpose:** Ensure platform trust and quality by verifying all doctor accounts before they become visible to patients.

- **Workflow & Dependencies:**
  1. **Submission:** Upon completion of Step 3, the submitted data automatically routes to an "Admin Verification Queue".
  2. **Pending State:** The doctor's account state defaults to `PENDING_VERIFICATION`. They may access a limited "under review" state in their dashboard but cannot receive bookings.
  3. **Admin Actions:** An administrator accesses a secure moderation portal to:
     - **Approve:** Doctor is published and goes live on the platform.
     - **Reject:** Doctor is denied access.
     - **Request Info / Keep Pending:** Admin can flag the profile for missing or suspicious information.

## 4. Frontend Architecture & Implementation Dependencies
### Frontend Flow Map
1. `GET /` -> Scroll to footer -> Click "For Partner"
2. `GET /partner/auth` (Login or Create Account options)
3. `GET /partner/onboarding` -> Renders multi-step form (Step 1, Step 2, Step 3)
4. `POST /api/partner/onboard` -> Submit payload to backend
5. `REDIRECT /doctor/dashboard` -> Display "Verification Pending" state

### Technical Stack Strategy
- **Form Management:** Use `react-hook-form` combined with `zod` for robust schema validation (ensuring Step 1 rules like "no numbers in name").
- **State Persistence:** Use `zustand` to manage the multi-step form state across the onboarding flow, preventing data loss between steps.
- **Scalability Considerations:**
  - Abstract the multi-step form into distinct, lazy-loaded components.
  - Structure the database payload to allow future expansion (e.g., Array of clinics instead of a single clinic object).
