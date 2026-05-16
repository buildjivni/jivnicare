export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
}

export const BLOG_CATEGORIES = [
  "All",
  "Digital Healthcare",
  "General Health",
  "Child Care",
  "Skin Care",
  "Heart Health",
  "Women's Health",
  "OPD Guidance",
  "Bihar Healthcare",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "digital-opd-transforming-bihar-healthcare",
    title: "How Digital OPDs Are Transforming Healthcare Access in Bihar",
    excerpt: "Discover how smart queues and digital appointment systems are reducing patient wait times by up to 70% across Patna and tier-2 cities.",
    content: `
## The Waiting Room Problem

For decades, visiting a specialist in Bihar meant sacrificing an entire day. Patients would travel from rural areas, arrive early in the morning, and wait in crowded clinics for hours — only to sometimes leave without being seen.

This traditional system created immense stress for patients and operational chaos for doctors. A general physician in Patna sees an average of 60–80 patients per day. Without a system, nobody really knows when their turn is.

## Enter the Digital OPD

With platforms like JivniCare, the paradigm is shifting. Digital OPDs (Outpatient Departments) introduce transparency and predictability into the healthcare journey.

### Key Benefits for Patients:
* **Predictable Wait Times:** Live queue tracking means you arrive exactly when it's your turn.
* **Reduced Clinic Crowding:** A calmer environment for both patients and staff.
* **Instant Booking:** Confirm appointments with verified specialists 24/7.
* **No More Wasted Days:** Book at night, arrive on time.

### Key Benefits for Doctors:
* **Structured Workflow:** Manage walk-ins and advance bookings from one dashboard.
* **Digital Reputation:** Real patient ratings build a credible online presence.
* **Less Admin:** No paper registers, no phone tag.

> "The ability to track my token live on my phone saved me 3 hours of waiting. I reached the clinic exactly 20 minutes before my turn." – Amit S., Patna.

## What Bihar's Healthcare Future Looks Like

As more clinics in Bihar adopt this technology, the focus is finally shifting back to where it belongs: patient care. The goal is not to replace the doctor-patient relationship — it's to protect it by removing all the friction around it.

JivniCare is Bihar's first step toward a healthcare system where no appointment is ever uncertain, and no patient ever sits in a waiting room wondering if their name will be called.
    `,
    author: "Dr. Ananya Sharma",
    authorRole: "Chief Medical Officer, JivniCare",
    category: "Digital Healthcare",
    publishedAt: "2026-05-10",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173ff9e5eb4?q=80&w=1200",
    tags: ["Digital Health", "Bihar", "OPD", "Patna"],
  },
  {
    id: "2",
    slug: "summer-skincare-tips-patna",
    title: "Essential Summer Skincare Tips for Bihar's Climate",
    excerpt: "Beat the harsh heat and humidity with these expert dermatologist-approved routines for glowing, healthy skin all summer long.",
    content: `
## Surviving Bihar's Summer Heat

The extreme summer heat in Bihar — often crossing 45°C — coupled with high humidity during the monsoon transition, can wreak havoc on your skin. Heat rashes, sunburns, and acne flare-ups are extremely common.

Here are essential tips from top dermatologists to keep your skin healthy through the season.

### 1. Hydration is Non-Negotiable

Drink at least 3 liters of water daily. Dehydration shows on your skin before you feel it in your body. Add a pinch of lemon and chia seeds to your water for electrolyte support.

### 2. Never Ever Skip Sunscreen

This is the single most important skin habit. Use a broad-spectrum SPF 50+ sunscreen on all exposed skin. Reapply every 3–4 hours if you are outdoors. Look for formulas labeled "non-comedogenic" (won't clog pores) if you are acne-prone.

### 3. Gentle Cleansing — Twice Daily

Wash your face with a mild, fragrance-free cleanser in the morning and at night. Harsh soaps strip your natural skin barrier and make heat rashes worse.

### 4. Wear Light, Breathable Fabrics

Cotton and linen are your best friends in summer. Synthetic fabrics trap sweat and dramatically increase your risk of rashes and fungal infections.

### 5. Watch Your Diet

Spicy, oily food in summer is a significant acne trigger for many people. Seasonal fruits — mango (in moderation), watermelon, and cucumber — are excellent for skin health.

> If you experience persistent acne, rashes, pigmentation, or any unusual skin changes, please consult a certified dermatologist. Home remedies can delay treatment and sometimes worsen conditions.

JivniCare has verified dermatologists in Patna who offer same-day appointments for urgent skin concerns.
    `,
    author: "Dr. Neha Verma",
    authorRole: "Senior Dermatologist",
    category: "Skin Care",
    publishedAt: "2026-05-12",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200",
    tags: ["Skincare", "Summer", "Dermatology", "Bihar"],
  },
  {
    id: "3",
    slug: "understanding-child-fever-when-to-worry",
    title: "Child Fever: When Should Parents Worry?",
    excerpt: "A comprehensive guide for parents on managing childhood fevers, recognizing danger signs, and knowing exactly when to see a pediatrician.",
    content: `
## Don't Panic — But Do Stay Alert

Fever is not a disease. It is a symptom — a sign that your child's immune system is working hard to fight off an infection. Most fevers in children are caused by viral infections and resolve on their own within 3–5 days.

However, for parents, a high temperature can be incredibly stressful. Here is what you actually need to know.

### When to Seek Immediate Medical Attention

These are red flags. If your child shows any of the following, go to a doctor immediately — do not wait:

* **Infants under 3 months:** Any fever (even mild) requires a doctor's visit. Their immune systems are not yet mature.
* **Persistent Fever:** Any fever lasting more than 3 days, regardless of temperature.
* **High Fever (Above 104°F / 40°C):** Especially if it is not responding to fever reducers.
* **Difficulty Breathing:** Fast breathing or visible effort to breathe is a serious warning sign.
* **Extreme Lethargy:** Difficult to wake, not responding normally.
* **Rashes:** Especially any rash that spreads rapidly or looks like pinpoint red spots.
* **Persistent Vomiting or Diarrhea:** Dehydration risk is very real in children.
* **Stiff Neck or Sensitivity to Light:** This can indicate meningitis — a medical emergency.

### Safe Home Care for Mild Fevers

If your child has a mild fever (below 102°F / 38.9°C) and is active, drinking fluids, and not in distress:

* Keep them cool and comfortable — light clothing, comfortable room temperature
* Offer frequent small sips of water, oral rehydration solution, or diluted juice
* Sponge with lukewarm (not cold) water if they are very uncomfortable
* Never give aspirin to children — it can cause a rare but serious condition called Reye's Syndrome

### Medications

Always consult your doctor before giving any fever medication to a child. Dosages depend strictly on weight, not age. Paracetamol (Crocin, Calpol) and Ibuprofen are the standard options for children above a certain age, but a pediatrician should guide you.

Keep a record of when you gave medication and the temperature readings to share with your doctor.
    `,
    author: "Dr. Rajesh Kumar",
    authorRole: "Consultant Pediatrician",
    category: "Child Care",
    publishedAt: "2026-05-14",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
    tags: ["Pediatrics", "Fever", "Child Health", "Parenting"],
  },
  {
    id: "4",
    slug: "heart-health-in-your-30s",
    title: "Why You Need to Prioritize Heart Health in Your 30s",
    excerpt: "Heart disease is increasingly affecting younger Indians. Learn the crucial lifestyle changes and screening tests you need to take right now.",
    content: `
## Heart Disease is No Longer Just for the Elderly

A decade ago, a 35-year-old with a heart attack was rare enough to make the news. Today, cardiologists in India are seeing this with alarming regularity. Lifestyle, stress, diet, and genetic factors are converging in a dangerous way for young urban Indians.

### Why Indian 30-Somethings Are at Risk

* **Sedentary desk jobs** — most Indians in cities now sit for 8–12 hours daily
* **High-sodium, high-fat diet** — combined with irregular meal timing
* **Unmanaged work stress** — cortisol chronically elevates blood pressure
* **Undetected conditions** — many people have high blood pressure or pre-diabetes for years without knowing

### The 5 Tests Every Adult Should Do Annually

If you are over 25, get these done every year:

1. **Lipid Profile (Cholesterol Panel)** — check LDL, HDL, and triglycerides
2. **Blood Pressure** — anything above 130/80 consistently needs attention
3. **Fasting Blood Sugar** — catch pre-diabetes early
4. **BMI & Waist Circumference** — abdominal fat is particularly dangerous for heart health
5. **ECG (Electrocardiogram)** — especially if you have a family history of heart disease

### Lifestyle Changes That Actually Work

The research is clear on these:

* **30 minutes of moderate activity, 5 days a week** — walking counts
* **Quit smoking** — smoking doubles your heart attack risk
* **Limit alcohol** — even moderate consumption raises blood pressure
* **Sleep 7–8 hours** — poor sleep is a significant cardiovascular risk factor
* **Reduce refined carbohydrates** — white rice, bread, and sugar spike insulin, which promotes inflammation

> Preventive cardiology is always cheaper — financially and emotionally — than emergency cardiology. Don't wait for a warning sign.

JivniCare has experienced cardiologists in Patna who offer comprehensive heart health checkup packages. Book an appointment today.
    `,
    author: "Dr. Sanjay Mishra",
    authorRole: "Consultant Cardiologist, AIIMS Patna",
    category: "Heart Health",
    publishedAt: "2026-05-15",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=1200",
    tags: ["Cardiology", "Heart Health", "Wellness", "Prevention"],
  },
  {
    id: "5",
    slug: "womens-health-check-up-guide",
    title: "The Complete Women's Health Checklist: What to Screen For at Every Age",
    excerpt: "From your 20s through your 50s — a clear, doctor-approved guide to essential health screenings every woman in India should prioritize.",
    content: `
## Healthcare Built Around You

Women's health needs are distinct, layered, and — often — systematically under-prioritized. This guide is designed to be your straightforward reference for what to screen for, and when.

### In Your 20s

* **Annual gynecologist visit** — establish a baseline and build a trusting relationship with your OB/GYN
* **Pap smear starting at 21** — screens for cervical cancer precursors
* **Skin checks** — sun damage builds in your 20s; catch unusual moles early
* **Iron levels** — anemia is extremely common in young Indian women
* **Blood pressure & blood sugar** — get a baseline at 21

### In Your 30s

* **Continue Pap smears** every 3 years (or every 5 years with HPV co-testing)
* **Thyroid function test (TSH)** — thyroid disorders peak in women in their 30s
* **Vitamin D & B12 levels** — deficiencies are prevalent and affect energy, bone health, and mood
* **Breast self-examination** monthly — know your baseline
* **Mental health assessment** — maternal mental health, work stress, and hormonal changes all peak here

### In Your 40s

* **Mammography** — starts at 40 if you have average risk, earlier with family history
* **Bone density scan (DEXA)** — especially if you smoke, have a low dairy intake, or use steroids
* **Colonoscopy** — if there is a family history of colon cancer
* **Cardiovascular risk assessment** — women's heart disease symptoms are often different; often missed

### In Your 50s & Beyond

* **Continue all above screenings**
* **Hormonal panel** during perimenopause and menopause transition
* **Annual eye and hearing checks**
* **Osteoporosis monitoring** — bone loss accelerates after menopause

> Preventive health is not a luxury — it is the most important investment you can make for your family and yourself. JivniCare has verified women's health specialists in Patna and across Bihar.
    `,
    author: "Dr. Priya Sinha",
    authorRole: "Senior Gynecologist & Women's Health Specialist",
    category: "Women's Health",
    publishedAt: "2026-05-16",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200",
    tags: ["Women's Health", "Preventive Care", "Gynecology", "Screenings"],
  },
  {
    id: "6",
    slug: "how-to-use-jivnicare-first-appointment",
    title: "Your First JivniCare Appointment: A Step-by-Step Guide",
    excerpt: "New to JivniCare? Here's how to find the right doctor, book your slot, and make the most of your appointment — in under 3 minutes.",
    content: `
## Getting Started is Simple

Booking a doctor should not require a tutorial. JivniCare is designed to be intuitive, especially for first-time users. But if you want the full picture, here is a walkthrough.

### Step 1: Search for Your Doctor or Specialty

From the JivniCare homepage, use the search bar to find doctors by:
* **Specialty** (e.g., "Cardiologist," "Skin Doctor," "Child Specialist")
* **Name** (if you already know who you want to see)
* **District** (e.g., "Doctors in Gaya")

You can also browse by specialty category or district directly from the navigation.

### Step 2: Check the Doctor's Profile

Each doctor's profile on JivniCare shows you:
* Verified qualifications and registration number
* Current queue status (live, so you know wait times)
* Consultation fee (transparent, no hidden charges)
* Patient reviews and ratings
* Clinic address and directions

### Step 3: Book Your Appointment

Hit "Book Appointment" and choose a convenient slot. You'll need to log in or create a patient account — it takes about 60 seconds with just your phone number.

### Step 4: Show Up Smart

You'll receive an SMS confirmation with your queue number. You can track your position in real-time. Arrive about 15 minutes before your expected slot.

### Step 5: After Your Appointment

After your visit, you can rate your doctor and leave a review on JivniCare. This helps future patients and helps good doctors build their reputation fairly.

## Pro Tips for the Best Experience

* **Be specific in your search** — "Pediatric Cardiologist in Patna" will return better results than just "Doctor"
* **Check the queue status before leaving home** — if there is a long queue, you'll know to delay slightly
* **Check reviews** — not just the star rating, but what patients actually wrote

JivniCare's support team is available 24/7 if you encounter any issues. We want your first experience to be excellent.
    `,
    author: "JivniCare Team",
    authorRole: "Patient Experience",
    category: "OPD Guidance",
    publishedAt: "2026-05-16",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1200",
    tags: ["OPD", "Booking", "JivniCare", "How-To"],
  },
];

export function getFeaturedPosts(count = 3) {
  return BLOG_POSTS.slice(0, count);
}

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string) {
  if (category === "All") return BLOG_POSTS;
  return BLOG_POSTS.filter((post) => post.category === category);
}
