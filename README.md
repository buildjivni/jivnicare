# JivniCare V1 — Live Patient Queue Architecture

## 1. Project Overview
JivniCare is a highly scalable, real-time clinic queue management system. It digitizes the patient waiting room, providing real-time tracking for walk-in and online patients while empowering doctors with a frictionless, mobile-first command center. It aims to reduce clinic chaos and improve patient wait-time predictability.

## 2. Architecture Overview
To understand JivniCare, you only need to understand three core pillars:
1. **Authentication:** Phone Number + OTP verification via Msg91/Twilio, protected by Upstash Redis rate-limiting. Sessions are managed via secure, HttpOnly JWT cookies.
2. **The Queue Engine:** Uses atomic database updates (`increment: 1`) in MongoDB to guarantee perfect, sequential token issuance. Emergency tokens bypass the standard queue using a separate atomic Redis counter.
3. **Doctor Command Center:** Built explicitly for Mobile. Doctors progress the queue by pressing and holding the "Call Next" FAB for 500ms. Swiping logic manages Holding and Recalling patients.

## 3. Folder Structure
The codebase strictly adheres to Next.js 14+ App Router conventions with a domain-driven design structure.

```text
/src
├── app/                  # Next.js App Router (Pages, API Routes)
│   ├── (booking)/        # Patient-facing flows (Search, Profile, Checkout)
│   ├── (public)/         # Marketing, Auth, Onboarding
│   ├── admin/            # Admin operations dashboard
│   ├── api/              # Unified REST API 
│   │   ├── auth/         # OTP and JWT generation
│   │   ├── doctor/       # Queue state mutations
│   │   ├── patient/      # Booking generation
│   └── doctor/           # Doctor Command Center UI
├── components/           # Generic UI building blocks (Shadcn + Tailwind)
├── features/             # Domain-specific logic (auth, doctor, queue)
├── lib/                  # Infrastructure (db, utils, analytics)
└── types/                # Global TypeScript definitions
```

## 4. Environment Setup
Create a `.env` file in the root directory based on `.env.example`.

**Required Keys:**
*   `DATABASE_URL`: MongoDB Atlas connection string (ensure `?maxPoolSize=10` is appended).
*   `UPSTASH_REDIS_REST_URL` & `TOKEN`: For rate limiting and fast-access queue states.
*   `JWT_SECRET`: Secure string for signing auth tokens.
*   `NEXT_PUBLIC_API_URL`: Set to `http://localhost:3000` for local dev.

## 5. Local Development
1. **Install Dependencies:** `npm install`
2. **Generate Prisma Client:** `npx prisma generate`
3. **Start Development Server:** `npm run dev`
4. **Test Accounts:** Set `TEST_OTP_MODE=true` in your `.env`. You can then use `9999999999` to bypass SMS sending and automatically authenticate.

## 6. Production Deployment
JivniCare is optimized for **Vercel** (Edge + Serverless).
*   **Build Command:** `npm run build`
*   **Install Command:** `npm install`
*   **Database:** Ensure MongoDB IP Access List allows Vercel connections (or `0.0.0.0/0` if securely credentialed).
*   **Environment:** Ensure all production environment variables are injected into Vercel. `VERCEL_URL` handles dynamic routing internally.

## 7. Troubleshooting
*   **Queue Desyncs:** If the queue visual representation does not match the database, verify the Upstash Redis connection. The system falls back to DB polling if Redis fails, but UI updates might lag.
*   **Build Fails (Prisma):** If `npm run build` fails on typechecks regarding `PrismaClient`, run `npx prisma generate` locally and ensure the schema is pushed.
*   **OTP Not Arriving:** Check the API provider dashboard (Twilio/Msg91). If rate-limited, wait 15 minutes for the Upstash IP bucket to clear.

---
*Built for scale. Designed for trust. Ready for production.*
