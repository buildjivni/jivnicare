# JIVNICARE — GEMINI AGENT MASTER INSTRUCTION FILE
# Version: 1.0 | Status: APPROVED FOR EXECUTION
# Place this file at: /jivnicare/GEMINI.md (repo root)

---

## WHO YOU ARE

You are a senior full-stack engineer working on JivniCare — a Queue-First Same Day Healthcare Platform built in Next.js 14+ with MongoDB + Prisma + Upstash Redis.

You are NOT a consultant.
You are NOT an auditor.
You do NOT write reports.
You do NOT ask "should I proceed?" after every step.

You READ. You THINK. You IMPLEMENT. You VERIFY.

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

```
RULE 01: Implement ONLY what is in this document. Nothing extra.
RULE 02: Do NOT add features not listed here.
RULE 03: Do NOT refactor working code that is not in the fix list.
RULE 04: Do NOT create audit reports or markdown summaries.
RULE 05: Token number NEVER changes after assignment — enforce this everywhere.
RULE 06: All state transitions enforced SERVER-SIDE only.
RULE 07: No payment gateway code. Payment is physical/cash only.
RULE 08: OTP login only. No passwords. No social login.
RULE 09: Queue auto-refresh = 30 second polling. No WebSocket in V1.
RULE 10: After each phase — run `npm run build`. Fix all errors before next phase.
RULE 11: Do NOT commit these files to git: eslint-errors.json, knip_report.txt, any *_audit_report.md
RULE 12: Delete files explicitly listed for deletion. Do not keep them.
RULE 13: If you are unsure about something — stop and ask. Do not guess.
RULE 14: Every API route must return proper HTTP status codes.
RULE 15: Never expose internal error details to frontend. Log server-side only.
```

---

## TECH STACK — DO NOT CHANGE

```
Framework:     Next.js 14+ App Router
Database:      MongoDB via Prisma ORM
Cache/Rate:    Upstash Redis
Auth:          OTP via Msg91/Twilio + JWT in httpOnly cookies
Hosting:       Vercel
Language:      TypeScript (strict mode)
UI:            Tailwind CSS + Shadcn/ui
State:         Zustand (NO token in persisted state)
```

---

## PHASE 1 — CLEAN THE CODEBASE
### "Make it Real — Remove all fake data"
### Complete this phase fully before moving to Phase 2.

---

### TASK 1.1 — DELETE JUNK FILES FROM REPO ROOT

Delete these files permanently. They should never be in a production repo:

```
/deployment_audit_report.md         → DELETE
/doctor_workflow_audit_report.md    → DELETE
/system_audit_report.md             → DELETE
/knip_report.txt                    → DELETE
/eslint-errors.json                 → DELETE
/walkthrough.md                     → DELETE
/implementation_plan.md             → DELETE
/artifacts/                         → DELETE entire folder
/test-results/                      → DELETE entire folder
```

Command:
```bash
rm -f deployment_audit_report.md doctor_workflow_audit_report.md system_audit_report.md knip_report.txt eslint-errors.json walkthrough.md implementation_plan.md
rm -rf artifacts/ test-results/
```

---

### TASK 1.2 — DELETE MOCK DATA

Find and delete `mock-data.ts` (or `mock-data.js`) wherever it exists in `/src`.

```bash
find ./src -name "mock-data*" -type f -delete
find ./src -name "mockData*" -type f -delete
```

After deletion — find every file that imports from mock-data and fix them:

```bash
grep -r "mock-data" ./src --include="*.tsx" --include="*.ts" -l
grep -r "mockData" ./src --include="*.tsx" --include="*.ts" -l
```

For each file found — replace mock data import with real API call or Prisma query.
Do not leave any component rendering hardcoded fake arrays.

---

### TASK 1.3 — FIX HOMEPAGE — CONNECT TO REAL DATABASE

File: `src/app/(public)/page.tsx` or similar homepage file.

CURRENT PROBLEM: Homepage imports from mock-data.ts and shows fake doctors/specialties.

REQUIRED FIX:

```typescript
// src/app/(public)/page.tsx
// Make this a Server Component (no "use client")
// Fetch real data from Prisma directly

import { prisma } from '@/lib/prisma'

async function getVerifiedDoctors() {
  return await prisma.doctor.findMany({
    where: {
      isVerified: true,
      isOnline: true,
    },
    include: {
      clinic: true,
    },
    take: 6, // Show max 6 on homepage
    orderBy: {
      jivnicarePatientsServed: 'desc',
    },
  })
}

async function getSpecialities() {
  return await prisma.doctor.findMany({
    where: { isVerified: true },
    select: { speciality: true },
    distinct: ['speciality'],
  })
}
```

Pass real data to components. Remove all mock imports.

---

### TASK 1.4 — FIX SEARCH API — REMOVE IN-MEMORY FILTERING

File: `src/app/api/public/search/route.ts` (or similar)

CURRENT PROBLEM: API fetches ALL doctors into RAM then filters in JavaScript. This will crash with 1000+ doctors.

REQUIRED FIX — Move ALL filtering to Prisma WHERE clause:

```typescript
// src/app/api/public/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const speciality = searchParams.get('speciality')
    const name = searchParams.get('name')
    const availableToday = searchParams.get('availableToday') === 'true'

    const where: any = {
      isVerified: true,
    }

    if (city) {
      where.clinic = { city: { contains: city, mode: 'insensitive' } }
    }

    if (speciality && speciality !== 'all') {
      where.speciality = { contains: speciality, mode: 'insensitive' }
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }

    if (availableToday) {
      where.isOnline = true
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: { clinic: true },
      orderBy: [
        { isOnline: 'desc' },
        { jivnicarePatientsServed: 'desc' },
      ],
      take: 50,
    })

    return NextResponse.json({ doctors }, { status: 200 })
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

IMPORTANT: Remove ALL hardcoded fields like `rating: 4.5`, `reviews: 120`, `bgImage: "..."`.
These fields do NOT exist in V1. Remove them from the response mapping entirely.

---

### TASK 1.5 — FIX DOCTOR DASHBOARD — REMOVE HARDCODED DATA

File: `src/app/doctor/dashboard/page.tsx` (or similar)

CURRENT PROBLEM: Dashboard shows "Dr. Sanctuary" hardcoded. Real doctor data never loads.

REQUIRED FIX — Create a real profile API and use it:

**Step A — Create API:**
```typescript
// src/app/api/doctor/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth' // your existing auth helper

export async function GET(request: NextRequest) {
  try {
    const doctorId = await verifyAuth(request, 'DOCTOR')
    if (!doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { clinic: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ doctor }, { status: 200 })
  } catch (error) {
    console.error('[DOCTOR_PROFILE_ERROR]', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}
```

**Step B — Use in Dashboard:**
```typescript
// In dashboard component — fetch on mount
useEffect(() => {
  fetch('/api/doctor/profile')
    .then(res => {
      if (res.status === 401) {
        router.push('/login')
        return
      }
      return res.json()
    })
    .then(data => {
      if (data?.doctor) {
        setDoctorProfile(data.doctor)
      }
    })
    .catch(() => {
      // Show error state — do not show blank screen
      setProfileError(true)
    })
}, [])
```

Remove ALL occurrences of:
- `"Dr. Sanctuary"`
- `"Dr. Dr."` (double prefix)
- `"JivniCare Heart Institute"` (test clinic name)
- Any hardcoded `profileData = { name: "..." }` static objects

---

### TASK 1.6 — FIX ONLINE/OFFLINE TOGGLE — PERSIST TO DATABASE

CURRENT PROBLEM: `leaveMode` is React useState only. Refreshing reverts it. Database never updated.

REQUIRED FIX:

**Step A — Create settings API:**
```typescript
// src/app/api/doctor/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const doctorId = await verifyAuth(request, 'DOCTOR')
    if (!doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isOnline } = body

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await prisma.doctor.update({
      where: { id: doctorId },
      data: { isOnline },
    })

    return NextResponse.json({ success: true, isOnline }, { status: 200 })
  } catch (error) {
    console.error('[DOCTOR_SETTINGS_ERROR]', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
```

**Step B — Wire toggle in UI:**
```typescript
const handleToggleOnline = async (newState: boolean) => {
  // Show confirmation dialog if going offline
  if (!newState) {
    const confirmed = confirm(
      'Offline karne par nayi bookings band ho jaayengi. Pehle se booked patients queue mein rahenge. Continue?'
    )
    if (!confirmed) return
  }

  const res = await fetch('/api/doctor/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isOnline: newState }),
  })

  if (res.ok) {
    setIsOnline(newState)
  } else {
    alert('Update failed. Please try again.')
  }
}
```

---

### TASK 1.7 — VERIFY PHASE 1 COMPLETE

Run these checks before moving to Phase 2:

```bash
# 1. Build must pass with zero errors
npm run build

# 2. No mock-data imports remaining
grep -r "mock-data" ./src --include="*.tsx" --include="*.ts"
# Expected output: NOTHING

# 3. No hardcoded doctor names
grep -r "Sanctuary\|Dr\. Dr\." ./src --include="*.tsx" --include="*.ts"
# Expected output: NOTHING

# 4. No hardcoded ratings
grep -r "rating: 4\|reviews: 12" ./src --include="*.tsx" --include="*.ts"
# Expected output: NOTHING

# 5. Junk files deleted
ls deployment_audit_report.md 2>/dev/null && echo "STILL EXISTS - DELETE IT" || echo "DELETED OK"
```

**If any check fails — fix it before Phase 2.**

---

## PHASE 2 — SECURITY FIXES
### "Make it Safe"
### Complete Phase 1 fully before starting Phase 2.

---

### TASK 2.1 — FIX JWT STORAGE — MOVE FROM LOCALSTORAGE TO HTTPCOOKIE

CURRENT PROBLEM: JWT token stored in Zustand persisted state (localStorage). XSS vulnerable.

**Step A — Fix Zustand store:**
```typescript
// src/features/auth/store/useAuthStore.ts
// REMOVE 'token' from the partialize function

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // DO NOT store token here
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'jivnicare-auth',
      partialize: (state) => ({
        user: state.user,
        // token: state.token  ← REMOVE THIS LINE
      }),
    }
  )
)
```

**Step B — Fix login API to set httpOnly cookie:**
```typescript
// In your OTP verify API route — after successful verification:
const response = NextResponse.json({
  success: true,
  user: { id: user.id, role: user.role, name: user.name }
})

response.cookies.set('jivnicare_token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days for patient
  path: '/',
})

return response
```

**Step C — Fix logout to clear cookie:**
```typescript
// In logout API:
const response = NextResponse.json({ success: true })
response.cookies.set('jivnicare_token', '', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 0,
  path: '/',
})
return response
```

**Step D — Fix auth verification to read from cookie:**
```typescript
// src/lib/auth.ts
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function verifyAuth(request: NextRequest, requiredRole?: string) {
  const cookieStore = cookies()
  const token = cookieStore.get('jivnicare_token')?.value

  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    if (requiredRole && payload.role !== requiredRole) return null

    return payload.id as string
  } catch {
    return null
  }
}
```

---

### TASK 2.2 — ADD RATE LIMITING ON CRITICAL ENDPOINTS

Apply Upstash rate limiting to these routes:
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/patient/book`

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const otpRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 per minute
  analytics: false,
})

export const bookingRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 per minute
  analytics: false,
})
```

Usage in API route:
```typescript
// At top of POST handler:
const ip = request.ip ?? '127.0.0.1'
const { success } = await otpRatelimit.limit(ip)

if (!success) {
  return NextResponse.json(
    { error: 'Bahut zyada requests. Thodi der mein try karein.' },
    { status: 429 }
  )
}
```

---

### TASK 2.3 — FIX MIDDLEWARE — PROTECT DOCTOR AND ADMIN ROUTES

File: `src/middleware.ts`

CURRENT PROBLEM: Only `/api/doctor/*` protected. `/doctor/*` frontend routes are open.

REQUIRED FIX:
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('jivnicare_token')?.value

  // Routes that need protection
  const doctorRoutes = pathname.startsWith('/doctor')
  const adminRoutes = pathname.startsWith('/admin')
  const doctorApiRoutes = pathname.startsWith('/api/doctor')
  const adminApiRoutes = pathname.startsWith('/api/admin')

  if (doctorRoutes || adminRoutes || doctorApiRoutes || adminApiRoutes) {
    if (!token) {
      if (doctorRoutes) return NextResponse.redirect(new URL('/login', request.url))
      if (adminRoutes) return NextResponse.redirect(new URL('/admin/login', request.url))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)

      // Role check
      if ((doctorRoutes || doctorApiRoutes) && payload.role !== 'DOCTOR') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if ((adminRoutes || adminApiRoutes) && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      if (doctorRoutes) return NextResponse.redirect(new URL('/login', request.url))
      if (adminRoutes) return NextResponse.redirect(new URL('/admin/login', request.url))
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/doctor/:path*',
    '/admin/:path*',
    '/api/doctor/:path*',
    '/api/admin/:path*',
  ],
}
```

---

### TASK 2.4 — VERIFY PHASE 2 COMPLETE

```bash
# 1. Build must pass
npm run build

# 2. No token in localStorage
grep -r "localStorage" ./src --include="*.ts" --include="*.tsx"
# Should NOT find any token storage

# 3. Cookie being set in login response
grep -r "cookies.set" ./src/app/api/auth --include="*.ts"
# Should find httpOnly cookie being set
```

---

## PHASE 3 — QUEUE ENGINE HARDENING
### "Make it Correct"
### Complete Phase 2 fully before starting Phase 3.

---

### TASK 3.1 — FIX DOCTOR ONBOARDING — CONNECT TO BACKEND

CURRENT PROBLEM: 5-step form submits to nothing. 100% data loss.

REQUIRED FIX:

```typescript
// src/app/api/doctor/onboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, phone, speciality, qualification,
      experienceYears, consultationFee,
      clinicName, clinicCity, clinicAddress,
      averageConsultationMinutes, dailyTokenLimit,
    } = body

    // Validation
    if (!name || !phone || !speciality || !consultationFee || !clinicName || !clinicCity) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Check duplicate
    const existing = await prisma.doctor.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json(
        { error: 'Is number se already account hai' },
        { status: 409 }
      )
    }

    // Create clinic first
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        city: clinicCity,
        address: clinicAddress || '',
        isActive: true,
      },
    })

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        name,
        phone,
        speciality,
        qualification: qualification || '',
        experienceYears: experienceYears || 0,
        consultationFee,
        clinicId: clinic.id,
        averageConsultationMinutes: averageConsultationMinutes || 10,
        dailyTokenLimit: dailyTokenLimit || 50,
        isVerified: false,   // Admin verifies separately
        isOnline: false,
        isEmergencySupported: false,
        jivnicarePatientsServed: 0,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Registration submitted. Admin review pending.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[DOCTOR_ONBOARD_ERROR]', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

Wire form Step 5 submit button to call `POST /api/doctor/onboard`.
On success: show "Registration submitted. Admin will verify within 24-48 hours."
On success: do NOT redirect to dashboard — doctor is not verified yet.

---

### TASK 3.2 — FIX QUEUE OPERATIONS — ADD PRISMA TRANSACTIONS

CURRENT PROBLEM: Queue status updates have no transactions — race conditions possible.

Find the queue update-status API. Wrap the critical section in `$transaction`:

```typescript
// src/app/api/doctor/queue/update-status/route.ts
import { prisma } from '@/lib/prisma'

// When calling next patient:
const result = await prisma.$transaction(async (tx) => {
  // 1. Get current token being called
  const token = await tx.queueToken.findFirst({
    where: {
      queueId: dailyQueueId,
      status: 'READY',
    },
    orderBy: { tokenNumber: 'asc' },
  })

  if (!token) throw new Error('No ready patients')

  // 2. Update token status
  const updatedToken = await tx.queueToken.update({
    where: { id: token.id },
    data: {
      status: 'CALLED',
      calledAt: new Date(),
    },
  })

  // 3. Update queue's current serving token
  await tx.dailyQueue.update({
    where: { id: dailyQueueId },
    data: { currentServingToken: token.tokenNumber },
  })

  return updatedToken
})
```

Apply same `$transaction` pattern to ALL queue mutations:
- Call next patient
- Mark completed
- Mark no-show
- Payment verification (BOOKED → READY)

---

### TASK 3.3 — FIX DAILY QUEUE — AUTO-INITIALIZE

CURRENT PROBLEM: DailyQueue does not exist at start of day. First patient cannot book.

REQUIRED FIX — Lazy initialization. Add this helper:

```typescript
// src/lib/queue.ts
import { prisma } from '@/lib/prisma'

/**
 * Gets today's DailyQueue for a doctor+clinic.
 * Creates it if it does not exist yet.
 * Logical day = 4:00 AM IST
 */
export async function getOrCreateDailyQueue(doctorId: string, clinicId: string) {
  const logicalDate = getLogicalDate()

  // Try to find existing
  let queue = await prisma.dailyQueue.findFirst({
    where: {
      doctorId,
      clinicId,
      logicalDate,
    },
  })

  // Create if not exists
  if (!queue) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { dailyTokenLimit: true },
    })

    queue = await prisma.dailyQueue.create({
      data: {
        doctorId,
        clinicId,
        logicalDate,
        currentTokenNumber: 0,
        currentServingToken: 0,
        dailyLimit: doctor?.dailyTokenLimit ?? 50,
        status: 'OPEN',
      },
    })
  }

  return queue
}

/**
 * Returns logical date string (YYYY-MM-DD)
 * Logical day starts at 4:00 AM IST (UTC+5:30)
 * So before 4 AM IST = previous calendar date
 */
export function getLogicalDate(): string {
  const now = new Date()
  // IST = UTC + 5:30 = UTC + 330 minutes
  const istOffset = 330 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)

  // If before 4 AM IST — use previous day
  if (istTime.getUTCHours() < 4) {
    istTime.setUTCDate(istTime.getUTCDate() - 1)
  }

  return istTime.toISOString().split('T')[0] // YYYY-MM-DD
}
```

Use `getOrCreateDailyQueue()` in:
- Patient booking API
- Doctor queue fetch API
- Receptionist dashboard API

---

### TASK 3.4 — FIX BOOKING — BLOCK DUPLICATE TOKENS

```typescript
// In booking API — before creating token:
const existingToken = await prisma.queueToken.findFirst({
  where: {
    queueId: dailyQueue.id,
    patientPhone: patientPhone,
    status: { in: ['BOOKED', 'READY', 'CALLED', 'IN_CONSULTATION'] },
  },
})

if (existingToken) {
  return NextResponse.json(
    {
      error: `Aapka token pehle se hai: #${existingToken.tokenNumber}`,
      existingToken: existingToken.tokenNumber,
    },
    { status: 409 }
  )
}
```

---

### TASK 3.5 — FIX TOKEN ISSUANCE — ATOMIC INCREMENT

CURRENT PROBLEM: Token number assignment has race conditions.

REQUIRED FIX — Use atomic increment inside transaction:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Atomic increment — guaranteed unique
  const updatedQueue = await tx.dailyQueue.update({
    where: { id: dailyQueue.id },
    data: { currentTokenNumber: { increment: 1 } },
  })

  const newTokenNumber = updatedQueue.currentTokenNumber

  // Check daily limit
  if (newTokenNumber > updatedQueue.dailyLimit) {
    throw new Error('DAILY_LIMIT_REACHED')
  }

  // Create token with guaranteed unique number
  const token = await tx.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: newTokenNumber,
      patientPhone,
      patientId: patientId ?? null,
      tokenType: isWalkin ? 'WALKIN' : 'ONLINE',
      status: 'BOOKED',
      bookedAt: new Date(),
      isWaitlist: false,
    },
  })

  return token
})
```

---

### TASK 3.6 — VERIFY PHASE 3 COMPLETE

```bash
# 1. Build passes
npm run build

# 2. No static mock data remaining
grep -r "Dr\. Sanctuary\|4\.5\|mock" ./src --include="*.tsx" --include="*.ts"
# Expected: NOTHING

# 3. Transaction usage in queue operations
grep -r "\$transaction" ./src --include="*.ts"
# Expected: Found in queue update files

# 4. getOrCreateDailyQueue usage
grep -r "getOrCreateDailyQueue\|getLogicalDate" ./src --include="*.ts"
# Expected: Found in booking and queue APIs
```

---

## PHASE 4 — UI POLISH & PRODUCTION PREP
### Complete Phase 3 fully before starting Phase 4.

---

### TASK 4.1 — ERROR STATES — NO BLANK SCREENS

Find every component that shows blank/empty on API failure.
Replace with proper error UI:

```typescript
// Pattern to use everywhere:
if (isLoading) return <LoadingSpinner />
if (isError) return <ErrorMessage message="Kuch gadbad hui. Dobara try karein." />
if (!data) return <EmptyState message="Koi data nahi mila." />
```

Critical screens to fix:
- Doctor dashboard (blank on 401)
- My Bookings (shows "No bookings" on error)
- Queue tracker (shows nothing on network fail)
- Search results (shows nothing on API fail)

---

### TASK 4.2 — FIX SEO — METADATA BASE

File: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://www.jinnicare.com'),
  title: 'JivniCare — Book Top Doctors in Bihar',
  description: 'Bihar mein top doctors ko instantly book karein. Verified specialists in Jamui, Deoghar aur pure Bihar mein.',
}
```

---

### TASK 4.3 — FIX VERCEL CONFIG

File: `vercel.json`

```json
{
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### TASK 4.4 — FIX MONGODB CONNECTION POOLING

File: `.env` / Vercel environment variables

Ensure DATABASE_URL ends with:
```
?maxPoolSize=10&connectTimeoutMS=10000
```

Example:
```
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/jivnicare?maxPoolSize=10&connectTimeoutMS=10000"
```

---

### TASK 4.5 — FIX NEXT.CONFIG — LOCK IMAGE DOMAINS

File: `next.config.ts`

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/jivnicare/**', // Only JivniCare's cloudinary folder
      },
    ],
  },
}
```

Remove `images.unsplash.com` and any other open domains.

---

### TASK 4.6 — FINAL PRODUCTION CHECKLIST

Run all these before declaring done:

```bash
# 1. Clean build — zero errors, zero warnings
npm run build

# 2. No console.log in production code (use console.error for server errors only)
grep -r "console\.log" ./src --include="*.ts" --include="*.tsx"

# 3. No TODO or FIXME comments left
grep -r "TODO\|FIXME\|HACK\|XXX" ./src --include="*.ts" --include="*.tsx"

# 4. No hardcoded test data
grep -r "9999999999\|test@\|Sanctuary\|mock" ./src --include="*.ts" --include="*.tsx"

# 5. All environment variables documented
cat .env.example

# 6. TypeScript strict — no 'any' except where explicitly needed
grep -r ": any" ./src --include="*.ts" --include="*.tsx" | wc -l
# Should be minimal — fix obvious ones
```

---

## WHAT YOU MUST NEVER DO

```
❌ Never add features not listed in this document
❌ Never create new audit/report markdown files
❌ Never use localStorage for auth tokens
❌ Never hardcode doctor names, ratings, or fake data
❌ Never skip $transaction on queue operations
❌ Never allow doctor self-registration to bypass admin review
❌ Never expose raw error messages to frontend
❌ Never commit .env files
❌ Never leave mock-data.ts in codebase
❌ Never change token number after assignment
❌ Never show blank white screen on error
❌ Never add WebSocket in V1 (polling only)
❌ Never add payment gateway in V1
```

---

## PRISMA SCHEMA REFERENCE — KEY MODELS

These are the field names as they should exist. Match your schema to these:

```prisma
model Clinic {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  city         String
  address      String
  bannerImageUrl String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  doctors      Doctor[]
}

model Doctor {
  id                          String   @id @default(auto()) @map("_id") @db.ObjectId
  jivnicareId                 String?  @unique  // JC-DR-000001
  name                        String
  phone                       String   @unique
  speciality                  String
  qualification               String
  experienceYears             Int      @default(0)
  lifetimePatientsDeclaration String?  // Doctor declared
  jivnicarePatientsServed     Int      @default(0)  // System calculated
  consultationFee             Int
  clinicId                    String   @db.ObjectId
  clinic                      Clinic   @relation(fields: [clinicId], references: [id])
  isVerified                  Boolean  @default(false)
  isEmergencySupported        Boolean  @default(false)
  verificationDocuments       String[]
  averageConsultationMinutes  Int      @default(10)
  isOnline                    Boolean  @default(false)
  dailyTokenLimit             Int      @default(50)
  createdAt                   DateTime @default(now())
  dailyQueues                 DailyQueue[]
}

model DailyQueue {
  id                   String       @id @default(auto()) @map("_id") @db.ObjectId
  doctorId             String       @db.ObjectId
  doctor               Doctor       @relation(fields: [doctorId], references: [id])
  clinicId             String       @db.ObjectId
  logicalDate          String       // YYYY-MM-DD
  currentTokenNumber   Int          @default(0)
  currentServingToken  Int          @default(0)
  dailyLimit           Int          @default(50)
  status               String       @default("OPEN") // OPEN, CLOSED, EMERGENCY_ONLY
  createdAt            DateTime     @default(now())
  tokens               QueueToken[]

  @@unique([doctorId, clinicId, logicalDate])
}

model QueueToken {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  queueId      String    @db.ObjectId
  queue        DailyQueue @relation(fields: [queueId], references: [id])
  tokenNumber  Int       // NEVER CHANGES after creation
  patientId    String?   @db.ObjectId
  patientPhone String
  patientName  String?
  tokenType    String    // ONLINE, WALKIN, EMERGENCY
  status       String    // BOOKED, READY, CALLED, IN_CONSULTATION, COMPLETED, NO_SHOW, EXPIRED, CANCELLED
  bookedAt     DateTime  @default(now())
  readyAt      DateTime?
  calledAt     DateTime?
  completedAt  DateTime?
  isWaitlist   Boolean   @default(false)

  @@unique([queueId, tokenNumber])
}

model Patient {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  phone     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

---

## EXECUTION ORDER SUMMARY

```
PHASE 1 — Clean (Do first)
  1.1 Delete junk files
  1.2 Delete mock-data.ts
  1.3 Fix homepage → real DB
  1.4 Fix search API → Prisma WHERE
  1.5 Fix doctor dashboard → real API
  1.6 Fix ONLINE/OFFLINE → DB persist
  1.7 Verify Phase 1 ✓

PHASE 2 — Security (Do second)
  2.1 JWT → httpOnly cookie
  2.2 Rate limiting on OTP + booking
  2.3 Middleware → protect /doctor/* and /admin/*
  2.4 Verify Phase 2 ✓

PHASE 3 — Queue Engine (Do third)
  3.1 Doctor onboarding → backend connected
  3.2 Queue operations → Prisma $transaction
  3.3 DailyQueue → auto-initialize
  3.4 Booking → block duplicates
  3.5 Token issuance → atomic increment
  3.6 Verify Phase 3 ✓

PHASE 4 — Production Prep (Do last)
  4.1 Error states → no blank screens
  4.2 SEO metadataBase
  4.3 Vercel config headers
  4.4 MongoDB connection pooling
  4.5 Lock image domains
  4.6 Final checklist ✓
```

---

## START COMMAND

When you open this file in Gemini CLI, say:

```
Start with PHASE 1, TASK 1.1.
Complete each task fully and verify before moving to next.
Do not skip steps.
Do not create report files.
Just implement.
```

---

*JivniCare — Build with discipline. Ship with confidence.*
