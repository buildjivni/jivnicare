# JivniCare Backend Tasks

## Phase 1: Upload System
- [x] Add `LICENSE_DOCUMENT` to `MediaType` enum in Prisma schema
- [x] Install Cloudinary & Multer packages (already installed)
- [x] Implement `CloudinaryService` (already scaffolded, config verified)
- [x] Implement `UploadsController` with public and private endpoints
- [x] Configure Multer with file type & size validation

## Phase 2: Dashboard System
- [x] Implement `admin-dashboard.service.ts`
- [x] Implement `doctor-dashboard.service.ts`
- [x] Implement `user-dashboard.service.ts`
- [x] Create aggregated APIs in `DashboardController`

## Phase 3: Admin Moderation System
- [x] Implement moderation APIs (verify/reject doctor/hospital)
- [x] Log actions to `ModerationLog` table
- [x] Webhook triggers (Mock for ISR)

## Phase 4: Production Hardening
- [x] Install & configure `helmet`
- [x] Install & configure `@nestjs/throttler` (Rate Limiting)
- [x] Set up global ValidationPipe with `class-validator`
- [x] Integrate Winston for centralized logging

## Phase 5: Deployment Readiness
- [x] Configure `Joi` validation for `.env` variables (implemented using class-validator)
- [x] Update Dockerfile / Railway config if needed (verified Dockerfile and start.sh)

## Phase 6: SEO + Discoverability
- [x] Implement SEO API endpoints (`sitemap-data`, `districts`)

## Phase 7: Trust & Verification
- [x] Add Fake Detection logic to Moderation/Registration services
- [x] Add verified badge logic endpoints
- [x] Report/suspicious activity flagging (POST /api/trust/report)
- [x] Emergency hospital priority listing (GET /api/trust/emergency-hospitals)
- [x] Admin audit log & reports queue endpoints
- [x] Live ISR revalidation webhook (backend -> Next.js /api/revalidate)
- [x] Dynamic sitemap.ts connected to backend SEO API
- [x] Multer config extended to support PDF uploads
- [x] REVALIDATION_SECRET added to env validation + .env.example
- [x] Backend TypeScript build passes (Exit 0) ✅
