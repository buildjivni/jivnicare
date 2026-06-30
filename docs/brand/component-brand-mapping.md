# JivniCare Component Brand Mapping

**Version:** 1.0  
This document defines the official brand asset mappings for every UI component, page, and state in the JivniCare application. These mappings override all design assumptions and code-level placeholders.

---

## 1. Global Layout Mappings

| UI Component | Approved Brand Asset | Usage Constraints |
| :--- | :--- | :--- |
| **Website Header** | Primary Logo | Main desktop/tablet navigation header. |
| **Mobile Header** | Primary Logo | Mobile-breakpoint navigation header. |
| **Website Footer** | Primary Logo | Rendered on the official footer background color (`#5696C7`). |
| **Sidebar Expanded** | Primary Logo | Main navigation sidebar when expanded. |
| **Sidebar Collapsed**| Brand Icon | Collapsed sidebar navigation. |
| **Loader / Splash Screen** | Brand Icon | Central progress indicator or loading splash. |
| **Avatar / Profile Placeholder** | Brand Icon | User profile picture placeholder. |
| **Browser Tab / Bookmark** | Favicon |Programmatically generated `favicon-32.png` and `favicon-16.png`. |

---

## 2. Page & Section Mappings

| Section / Component | Approved Brand Asset | Rationale & Rules |
| :--- | :--- | :--- |
| **Landing Hero** | **No Branding** | Focus remains purely on patient search input and district selection. |
| **Search Section** | **No Branding** | Clean search field with no decorative logo overlays. |
| **Featured Doctors** | **No Branding** | Card grid focused on medical care details. |
| **Featured Hospitals** | **No Branding** | Card grid focused on clinical facilities. |
| **Login / Signup Pages** | Primary Logo | Centered identity brand placement on auth forms. |
| **OTP Verification** | Primary Logo | Verification identity confirmation. |
| **Success Screens** | Brand Icon | Renders as the center completion badge. |
| **Empty States** | Brand Icon | Informational placeholder (e.g., No Appointments, No Results). |
| **Error Pages (404/500)**| Brand Icon | Center status decoration. |
| **Email Headers** | Primary Logo | Official transactional headers. |
| **Invoice / PDF Header** | Primary Logo | Official corporate headers. |

---

## 3. Strict Prohibitions (No Branding Zones)

To maintain a clean digital clinic aesthetic, never embed JivniCare logos, icons, or wordmarks inside the following elements:
*   **Doctor Cards / Booking Widgets** (No decorative logos inside card borders)
*   **Hospital Cards / Clinic Info panels**
*   **Appointment / Queue Cards**
*   **Dashboard Widgets / Charts / Analytics Tables**

---

## 4. Layout Adaptation Constraint

> [!IMPORTANT]
> Layouts must adapt to the official brand assets, rather than forcing assets into existing placeholder containers.
> If a UI container stretches, squishes, or restricts the aspect ratio of the Primary Logo or Brand Icon, developers must rewrite the surrounding flex/grid containers to wrap the asset natively. Never modify the asset dimensions to fit broken layouts.