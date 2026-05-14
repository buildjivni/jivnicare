# JivniCare Master Requirements Document

*यह फाइल नए वर्किंग प्रोसेस (New Protocol) के तहत तैयार की गई है।* 
*इसमें हम प्रोजेक्ट से जुड़ी सभी Requirements, Analysis, और Approvals को सेव करेंगे।*

---

## 1. Requirement Draft: Admin Portal Architecture V1

**Goal:** Create a professional, secure Admin Panel for JivniCare staff to manage the platform, specifically focusing on verifying incoming Doctor registrations to complete the onboarding loop.

**Required Sections (Based on Reference Images):**
1. **Admin Dashboard (Overview):** High-level metrics like Total Verified Providers, Pending Verifications, Active Consultations, and Patient Satisfaction.
2. **Doctor Management (Verification Queue):** 
   - A data table listing all doctors with their verification status (`PENDING`, `VERIFIED`, `REJECTED`).
   - A slide-out panel or dedicated view to see a specific doctor's profile, including their submitted documents (e.g., Medical License), contact info, and experience.
   - Prominent "Approve Profile" and "Reject" buttons.
3. **Queue Monitoring (Global):** A high-level view of live queues across all hospitals/clinics (Total Patients Today, Average Wait Time).

**Role & Routing:** 
- Route: `/admin/dashboard`
- Strict separation from Patient and Doctor flows.

---

## 2. Architect Analysis & Suggestions (विश्लेषण)

Here is my professional analysis for the Admin Verification Panel:

### 1. Dashboard Layout Strategy
**Recommendation:** **Persistent Sidebar Navigation.**
*Reasoning:* Matches the provided reference images perfectly. The sidebar will contain "Dashboard", "Doctor Management", "Patient Records", "Queue Monitoring", and "Analytics".

### 2. The Verification Workflow (Core Requirement)
The most critical feature right now is the **Doctor Management** screen. When a doctor finishes onboarding (Step 5), they appear here as `PENDING`.
*Recommendation:* We will build a split-screen or slide-out drawer layout for this. The left side shows the table of doctors. Clicking a row opens the right side panel showing the Doctor's details and the Approve/Reject buttons (exactly matching Reference Image 1).

### 3. Missing Features to Adapt
- **Complaint Handling / Fake Reviews:** The reference images show this. We can build a placeholder UI for this in the V1 Dashboard overview to match the premium aesthetic.
- **Area Mapping:** We can simulate this visually in the overview to make the admin panel look like a true "Command Center".

---

## 3. Final Approval Status
- [ ] Pending Approval
- [ ] Approved for Implementation
