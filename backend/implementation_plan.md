# JivniCare Backend Architecture & Implementation Plan

This document outlines the architectural design and implementation strategy for finalizing the JivniCare backend. It covers the 7 critical phases required to transition the platform from MVP to a scalable, production-grade healthcare system.

## User Review Required
> [!IMPORTANT]
> Please review the proposed architecture, API contracts, and schema enhancements below. Once approved, we will begin the implementation phase by phase.
> Specifically, confirm if you prefer **Cloudinary** over AWS S3 for the Upload System (Phase 1), as Cloudinary handles automatic image compression and resizing out-of-the-box, which aligns well with the MVP timeline.

---

## 🧠 Core Architecture Rules (Enforced)
1. **Single Source of Truth**: `User` table is the root. Doctors and Hospitals are linked via `user_id`. Auth is purely JWT-based.
2. **Stateless UI**: Dashboards only consume aggregated APIs. No business logic in the Next.js frontend.
3. **Centralized Uploads**: All files go through the `UploadsModule` -> Cloud Storage -> returning only URLs to the DB.
4. **Immutable Moderation**: The `ModerationLog` tracks *every* state change for accountability.
5. **Decoupled Analytics**: Search and profile analytics run asynchronously without blocking core requests.

---

## 🧱 PHASE 1 — UPLOAD SYSTEM (CRITICAL)

### System Flow
```text
[Client] --(multipart/form-data)--> [NestJS UploadController]
                                         |
                                  (Multer + File Filter)
                                         |
                                 [CloudinaryService] --(Stream)--> [Cloudinary/S3]
                                         |
                                  (Returns Secure URL)
                                         |
                               [Save to DB `Media` Table]
                                         |
[Client] <--(Returns URL & ID)-----------+
```

### API Routes
- `POST /api/v1/uploads/public/image` (Profile/Gallery pics - compressed, public URL)
- `POST /api/v1/uploads/private/document` (Medical licenses - encrypted, private access)
- `DELETE /api/v1/uploads/:id` (Admin/Owner only)

### Schema Additions (Prisma)
*The existing `Media` table is sufficient, but we will strictly enforce the `MediaType` enum.*
```prisma
enum MediaType {
  DOCTOR_PROFILE
  HOSPITAL_GALLERY
  LICENSE_DOCUMENT // Added for private medical docs
}
```

---

## 📊 PHASE 2 — DASHBOARD SYSTEM

### Architecture
Dashboards require aggregated data to prevent the frontend from making waterfall requests. We will use the existing `DashboardModule`.

### API Routes
- `GET /api/v1/dashboard/user`
  - Returns: Upcoming bookings, saved doctors, recent searches.
- `GET /api/v1/dashboard/doctor`
  - Returns: Profile completion %, moderation status, analytics (views/searches), active specialties.
- `GET /api/v1/dashboard/admin`
  - Returns: Pending queue counts, system health, recent moderation logs, total verified entities.

---

## 🛡️ PHASE 3 — ADMIN MODERATION SYSTEM

### System Flow
```text
[Doctor Submits Profile] -> Status: PENDING
       |
[Admin Views Queue]      -> GET /api/v1/moderation/pending
       |
[Admin Action]           -> POST /api/v1/moderation/doctor/:id/verify
       |                        POST /api/v1/moderation/doctor/:id/reject
       +---> Updates Doctor `verificationStatus`
       +---> Creates `ModerationLog` (AdminID, TargetID, Action, Reason)
       +---> Triggers Webhook to Next.js (ISR Revalidation)
```

### API Routes
- `GET /api/v1/moderation/queue` (Filterable by `type`, `district`)
- `POST /api/v1/moderation/doctor/:id/action` (Body: `{ action: "VERIFY" | "REJECT", reason?: string }`)
- `POST /api/v1/moderation/hospital/:id/action`

---

## 🔒 PHASE 4 — PRODUCTION HARDENING

### Implementation Strategy
1. **Input Validation**: Enforce global `ValidationPipe` with `class-validator` (whitelist, forbid non-whitelisted).
2. **Rate Limiting**: Implement `@nestjs/throttler`.
   - Global: 100 req/min
   - Auth routes: 5 req/min
   - Search API: 30 req/min
3. **Security Headers**: Implement `helmet` for HTTP header security.
4. **Logging**: Integrate `winston` for centralized JSON logging.
   - Separate error logs (`error.log`) and combined logs (`combined.log`).
5. **Database Protection**: Prisma naturally prevents SQL injection via parameterized queries.

---

## 🚀 PHASE 5 — DEPLOYMENT READINESS

### Environment Separation
Strict `.env` validation using `@nestjs/config` and `Joi`. The app will fail to boot if critical keys (JWT_SECRET, DATABASE_URL) are missing.

### CI/CD Pipeline (GitHub Actions)
```text
[Push to Main] -> [Lint & Typecheck] -> [Run Tests] -> [Docker Build] -> [Railway Deploy]
                                                          |
                                                 [Prisma Migrate Deploy]
```

---

## 🔍 PHASE 6 — SEO + DISCOVERABILITY SYSTEM

The backend must feed the Next.js frontend with dynamic data for ISR (Incremental Static Regeneration).

### API Routes for Frontend SEO
- `GET /api/v1/seo/sitemap`
  - Returns a lightweight array of all verified doctor slugs, hospital slugs, and active districts for Next.js `sitemap.ts` generation.
- `GET /api/v1/seo/districts`
  - Returns all districts that have at least 1 verified doctor or hospital.

### Webhook Revalidation
When an Admin verifies a doctor, the backend will send a `POST` request to the Next.js frontend to instantly revalidate the `/doctor/[slug]` page.

---

## 🛡️ PHASE 7 — TRUST & VERIFICATION SYSTEM

### Fake Detection & Rules
1. **Duplicate Detection**: Prevent multiple doctors with the exact same name + district + phone number.
2. **Emergency Validation**: Hospitals claiming `emergencyAvailable = true` will be flagged for manual priority review.
3. **Verified Badges**: The API will explicitly return a `isVerified` boolean flag to the frontend, which the UI uses to render the green checkmark badge.

---

## 📁 Scalable Folder Structure (NestJS)

The current folder structure is already well-scaffolded. We will enforce the following pattern inside each module:

```text
src/modules/doctors/
├── doctors.controller.ts     # Route handling, DTO validation
├── doctors.service.ts        # Business logic, Prisma calls
├── dto/
│   ├── create-doctor.dto.ts  # class-validator schemas
│   └── update-doctor.dto.ts
├── entities/
│   └── doctor.entity.ts      # Swagger/Serialization entities
└── interfaces/               # Module-specific typings
```

## Verification Plan
1. Ensure all APIs return standardized JSON responses.
2. Run load tests on the Search API.
3. Verify JWT role-guards strictly block unauthorized access to Moderation APIs.
