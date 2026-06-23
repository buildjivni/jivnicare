# JivniCare — Search Engine Specification
# Document: 03-search-engine.md
# Version: V1.0.0

---

## ⚠ STRICT RULES — AI MUST FOLLOW

1. DO NOT use Elasticsearch, Algolia, or any external search service in V1
2. DO NOT implement rating-based scoring — no ratings system in V1
3. DO NOT add distance radius filter UI — V2 feature
4. DO NOT use MongoDB for search — PostgreSQL FTS only
5. USE exactly the 5-layer pipeline defined below
6. MINIMUM 2 characters required before search triggers
7. ASK NOTHING — execute exactly as written

---

## ARCHITECTURE — 5-Layer Search Pipeline

Layer 1: Query Understanding (symptom-map.ts)
Layer 2: PostgreSQL query — 8 fields simultaneously
Layer 3: In-memory Scoring Engine — 100 points total
Layer 4: Hard Filters — user-selected
Layer 5: Result Display — ranked doctor cards

---

## SCORING ENGINE — 100 Points Total

Keyword Match:      40 pts (name, clinic, bio, speciality, diseases)
Availability:       25 pts (isOnline=15, isAcceptingBookings=10)
Distance:           20 pts (Haversine — if user location provided)
Profile Complete:   10 pts (photo, bio, diseases filled)
Early Partner:       5 pts (EARLY_PARTNER tier bonus)

NO rating score — ratings system not in V1

---

## SCHEMA ADDITIONS — Add to doctors table

gender          String?    // "MALE", "FEMALE", "OTHER"
diseases        String[]   @default([])   // ["Diabetes", "BP", "Thyroid"]
procedures      String[]   @default([])   // ["ECG", "X-Ray", "Ultrasound"]

Migration: npx prisma migrate dev --name "add_search_fields"

---

## SYMPTOM MAP — src/lib/data/symptom-map.ts

200+ terms covering Hindi + English + Bhojpuri + common typos

CARDIOLOGY: heart, dil, bp, blood pressure, chest pain, seena dard, hart(typo)
GENERAL: fever, bukhar, cold, zukam, cough, khansi, weakness, thakaan
GASTRO: stomach, pet dard, acidity, loose motion, liver, piliya, jaundice
ORTHOPEDIC: bone, haddi, joint pain, kamar dard, knee, ghutna, fracture
DERMATOLOGY: skin, twacha, rash, allergy, daane, acne, khujli, itching
PEDIATRICS: child, bachcha, baby, vaccination, bal rog, kids doctor
OPHTHALMOLOGY: eye, aankh, vision, chasma, aankhon ka doctor
DENTISTRY: teeth, dant, toothache, cavity, dant dard
PULMONOLOGY: breathing, sans, asthma, lungs, tb, phephde
NEUROLOGY: headache, sir dard, migraine, chakkar, paralysis, laqwa
ENDOCRINOLOGY: diabetes, sugar, thyroid, blood sugar, madhumeh
GYNECOLOGY: women, mahila, pregnancy, period, delivery, ladies doctor
PSYCHIATRY: depression, anxiety, stress, mental, neend nahi
UROLOGY: kidney, stone, pathri, peshab, dialysis
ENT: ear, kaan, nose, naak, throat, gala, tonsil

TYPO CORRECTIONS:
dacter→doctor, docter→doctor, hart→heart, kidny→kidney, dibitiis→diabetes

---

## SEARCH FILTERS — V1

District:         Jamui | Deoghar (hard limit — always enforced)
Speciality:       Dropdown — all active specialities
Fee Range:        Under 200 | 200-500 | 500+
Gender:           Any | Male | Female
Language:         Hindi | English | Bhojpuri | Maithili
Available Today:  Toggle
Emergency Only:   Toggle

NOT in V1: Distance radius, Rating filter, Experience filter

---

## SEARCH API — GET /api/public/search

Query params: q, district, speciality, gender, language,
              availableToday, emergencyOnly, feeRange, lat, lng, page

Rate limit: 100 requests/hour
Min chars: 2 (return empty + message if 1 char)
Max query: 100 characters
Page size: 20 results
Safety cap: fetch max 500 from DB, score in memory

Response includes: doctor card data + total + emptyMessage

---

## HOMEPAGE API — GET /api/public/home

Returns:
- featuredDoctors (8): EARLY_PARTNER first → isOnline → most patients served
- specialities: all active, sorted by sortOrder
- districts: Jamui + Deoghar

---

## EMPTY STATE VARIANTS — 3 types

Variant 1 — Query no results:
  "No doctors found for [query]"
  "Request a Doctor in your area"
  → Form: phone + speciality → lead captured in DB

Variant 2 — Filters too tight:
  "No doctors match these filters"
  "Try removing some filters"
  → [Clear Filters] button

Variant 3 — Area no doctors yet:
  "Doctors are joining soon in [district]"
  "Get notified when available"
  → [Notify Me] → phone number captured

---

## TOKEN STATUS PAGE — Minimal Clean Design

HERO: Token number — large, bold, centered (#8)
SUB: Doctor name + speciality
QUEUE: "X patients ahead" + "Currently serving: #Y"
VISUAL: Simple progress bar (no time estimate — only position)
LOCATION: Clinic name + area — subtle, below fold
STATUS BADGE: Waiting (amber) | Called (green) | Completed (gray)
ACTION: Single button — [Cancel Booking] — visible only when cancellable
DIRECTION: Subtle text link — not a button
AUTO UPDATE: Silent 30s refresh — no "live updating" text shown
NO: Estimated time, overwhelming info, multiple CTAs

---

## EDGE CASES — All must be handled

query = "a"        → empty + "Type at least 2 characters"
query = ""         → show all verified doctors sorted by score
query = "hart"     → typo fixed → heart → Cardiologist
query = "dil doc"  → Hindi+English mix → Cardiologist
query = "JVC001"   → direct doctor ID match
query = "Dr Shrma" → partial name → Dr Sharma
All offline        → show anyway, sorted by profile completeness
No location given  → distance score = 0, other signals rank

---

## WHAT NOT TO BUILD IN V1

Elasticsearch, Algolia, MongoDB Atlas Search
Rating-based scoring
Distance radius filter UI
Search analytics
Autocomplete suggestions
Search history

---

## SCALE REFERENCE

0-200 doctors   → Current approach perfect
200-500         → Add PostgreSQL indexes (already in schema)
500-1000        → Expand dictionary, tune weights
1000+           → Consider dedicated search service

---

Document complete. Execute in sequence. Do not skip steps.
Last updated: June 2026 | JivniCare V1.0.0

---

## SPECIALITY LIST — Ordered by Usage Frequency

```typescript
// src/lib/data/specialities.ts
export const SPECIALITIES = [
  // TIER 1 — Most Common (Jamui/Deoghar market)
  { id: 1,  name: 'General Physician',   icon: '🩺', tier: 1 },
  { id: 2,  name: 'Pediatrician',        icon: '👶', tier: 1 },
  { id: 3,  name: 'Gynecologist',        icon: '🤱', tier: 1 },
  { id: 4,  name: 'Orthopedic',          icon: '🦴', tier: 1 },
  { id: 5,  name: 'Dentist',             icon: '🦷', tier: 1 },

  // TIER 2 — Regular
  { id: 6,  name: 'Dermatologist',       icon: '🔬', tier: 2 },
  { id: 7,  name: 'ENT Specialist',      icon: '👂', tier: 2 },
  { id: 8,  name: 'Ophthalmologist',     icon: '👁️', tier: 2 },
  { id: 9,  name: 'General Surgeon',     icon: '🏥', tier: 2 },
  { id: 10, name: 'Diabetologist',       icon: '💉', tier: 2 },

  // TIER 3 — Specialist
  { id: 11, name: 'Cardiologist',        icon: '❤️', tier: 3 },
  { id: 12, name: 'Neurologist',         icon: '🧠', tier: 3 },
  { id: 13, name: 'Gastroenterologist',  icon: '🫁', tier: 3 },
  { id: 14, name: 'Pulmonologist',       icon: '🫀', tier: 3 },
  { id: 15, name: 'Endocrinologist',     icon: '⚗️', tier: 3 },
  { id: 16, name: 'Urologist',           icon: '🧬', tier: 3 },
  { id: 17, name: 'Nephrologist',        icon: '💊', tier: 3 },
  { id: 18, name: 'Psychiatrist',        icon: '💭', tier: 3 },
  { id: 19, name: 'Physiotherapist',     icon: '🏃', tier: 3 },
  { id: 20, name: 'Radiologist',         icon: '📡', tier: 3 },
]

// For searchable dropdown — filter by name
export function filterSpecialities(query: string) {
  if (!query) return SPECIALITIES
  const q = query.toLowerCase()
  return SPECIALITIES.filter(s =>
    s.name.toLowerCase().includes(q)
  )
}
```

---

## SEARCHABLE DROPDOWN — Both Patient + Doctor

### Component: SpecialitySelect

```
Behavior:
- Click field → dropdown opens
- Shows TIER 1 first (Popular)
- Type to filter — instant, no API call
- Min 1 char to filter
- Shows icon + name
- Keyboard navigable (arrow keys + enter)
- Mobile: bottom sheet style
- Desktop: dropdown style

Patient search bar:
  Placeholder: "Search doctor or symptom..."
  → typing filters both symptom map + speciality list

Doctor registration:
  Placeholder: "Search your speciality..."
  → single select, required field
  → shows all 20 specialities grouped by tier
```

### UI Layout:
```
┌─────────────────────────────┐
│ 🔍 type to search...        │
├─────────────────────────────┤
│ POPULAR                     │
│ 🩺 General Physician        │
│ 👶 Pediatrician             │
│ 🤱 Gynecologist             │
│ 🦴 Orthopedic               │
│ 🦷 Dentist                  │
├─────────────────────────────┤
│ SPECIALISTS                 │
│ 🔬 Dermatologist            │
│ 👂 ENT Specialist           │
│ ... 13 more                 │
└─────────────────────────────┘

When typing "card":
┌─────────────────────────────┐
│ 🔍 card                     │
├─────────────────────────────┤
│ ❤️ Cardiologist             │
└─────────────────────────────┘
```

---

## SEARCH LOGGING — Anonymous Analytics

### Schema Addition — Add to prisma/schema.prisma:

```prisma
model SearchLog {
  id          String   @id @default(uuid())
  query       String
  district    String?
  resultCount Int      @default(0)
  createdAt   DateTime @default(now())

  @@index([query])
  @@index([district])
  @@index([createdAt])
  @@map("search_logs")
}
```

Migration:
```bash
npx prisma migrate dev --name "add_search_logs"
```

### Implementation — Fire and Forget:

```typescript
// Add to search.service.ts — after getting results
async function logSearchQuery(
  query: string,
  district: string | undefined,
  resultCount: number
) {
  // Never blocks main search — silent fail
  prisma.searchLog
    .create({
      data: {
        query: query.toLowerCase().trim().slice(0, 100),
        district,
        resultCount,
      },
    })
    .catch(() => {})
}
```

### Admin Dashboard — Top Searches Widget:

```typescript
// GET /api/admin/search-insights
// Returns top queries + zero-result queries

const topSearches = await prisma.searchLog.groupBy({
  by: ['query'],
  _count: { query: true },
  orderBy: { _count: { query: 'desc' } },
  take: 20,
  where: {
    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  }
})

const zeroResults = await prisma.searchLog.groupBy({
  by: ['query'],
  _count: { query: true },
  where: {
    resultCount: 0,
    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  },
  orderBy: { _count: { query: 'desc' } },
  take: 10,
})
```

### What Admin Sees:
```
📊 Top Searches — Last 7 Days
1. bukhar wala doctor    234 searches  → results ✅
2. haddi ka doctor       189 searches  → results ✅
3. aankhon mein jalan    156 searches  → 0 results ⚠
4. sugar ka doctor        98 searches  → results ✅

⚠ Zero Result Searches (Fix These):
- aankhon mein jalan → Add to symptom map
- pagli doctor       → Add psychiatrist keywords
- ultrasound center  → Add Radiologist mapping
```

### Privacy Rules:
- NO patient name stored
- NO phone number stored
- NO user ID linked
- Only: query text + district + result count + timestamp
- Data auto-delete after 90 days (cron job)

---

## UPDATED SEED DATA — specialities table

```typescript
// prisma/seed.ts — replace specialities array
const specialities = [
  { name: 'General Physician',  icon: '🩺', sortOrder: 1  },
  { name: 'Pediatrician',       icon: '👶', sortOrder: 2  },
  { name: 'Gynecologist',       icon: '🤱', sortOrder: 3  },
  { name: 'Orthopedic',         icon: '🦴', sortOrder: 4  },
  { name: 'Dentist',            icon: '🦷', sortOrder: 5  },
  { name: 'Dermatologist',      icon: '🔬', sortOrder: 6  },
  { name: 'ENT Specialist',     icon: '👂', sortOrder: 7  },
  { name: 'Ophthalmologist',    icon: '👁️', sortOrder: 8  },
  { name: 'General Surgeon',    icon: '🏥', sortOrder: 9  },
  { name: 'Diabetologist',      icon: '💉', sortOrder: 10 },
  { name: 'Cardiologist',       icon: '❤️', sortOrder: 11 },
  { name: 'Neurologist',        icon: '🧠', sortOrder: 12 },
  { name: 'Gastroenterologist', icon: '🫁', sortOrder: 13 },
  { name: 'Pulmonologist',      icon: '🫀', sortOrder: 14 },
  { name: 'Endocrinologist',    icon: '⚗️', sortOrder: 15 },
  { name: 'Urologist',          icon: '🧬', sortOrder: 16 },
  { name: 'Nephrologist',       icon: '💊', sortOrder: 17 },
  { name: 'Psychiatrist',       icon: '💭', sortOrder: 18 },
  { name: 'Physiotherapist',    icon: '🏃', sortOrder: 19 },
  { name: 'Radiologist',        icon: '📡', sortOrder: 20 },
]
```

---

Document updated: June 2026 | JivniCare V1.0.0

