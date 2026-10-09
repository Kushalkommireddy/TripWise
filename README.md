# TripWise — plan real trips across India, on a real budget

Sign in first (no marketing landing page), land on your 5 curated
destinations, tap into real research or add a custom AI-planned trip.

## Flow

1. **Start your journey** (`/`) — sign in or sign up. No landing page to scroll past.
2. **Sign up** — username, email, password (with a show/hide eye toggle).
3. **Dashboard** (`/dashboard`) — welcomes you by name, shows the 5 curated destinations (Leh-Ladakh, Kashi/Varanasi, Kashmir, Kerala, Goa) as cards, plus your own trips below.
4. **Explore a destination** (`/explore/[slug]`) — tap "Places to explore" or "Itinerary" to see the hand-researched content (from your spreadsheet), then "+ Add to my trips" with your budget to save it.
5. **Custom trip** — "+ New custom trip" on the dashboard for anywhere else in India. Places to cover and itinerary are generated **entirely by AI** (Claude) for these — no Wikipedia/OpenStreetMap dependency, clearly labeled "AI-suggested."
6. **Trip workspace** (`/trips/[id]`) — Places to cover, Itinerary (standard geometry-based or AI-assisted with a transport plan), Checklist (curated + your own items), Expenses (full CRUD).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Drizzle ORM** + **node-postgres** (Neon, Supabase, or any Postgres)
- **NextAuth v5** (credentials + bcrypt), full forgot/reset-password flow
- **Anthropic API** for: AI-only places + itinerary for custom destinations, and AI-assisted itinerary sequencing/transport planning for curated destinations
- Curated content: `src/lib/india-destinations.ts` and `src/lib/featured-trips.ts` (the 5 flagship destinations — real researched place lists, day-by-day plans, and Hyderabad-origin budgets)

## 1. Set up a database

[neon.tech](https://neon.tech) free tier, or Vercel → Storage → Create Database → Postgres.

## 2. Environment variables

Copy `.env.example` to `.env`:

```
DATABASE_URL="postgresql://...your db..."
NEXTAUTH_SECRET="a long random string"
NEXTAUTH_URL="http://localhost:3000"

# REQUIRED for custom (non-featured) destinations — Places to cover and
# Itinerary are 100% AI-generated for these, with no fallback.
# Get a key from console.anthropic.com
ANTHROPIC_API_KEY=""

# Optional — real reset-code emails. Without these, the code shows directly
# in the browser (dev convenience only, never in production).
RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
```

Windows without `openssl`:
```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. Push the schema, run

```bash
npm install
npm run db:push
npm run dev
```

## 4. Deploy to Vercel

Push to GitHub → import at vercel.com/new → add the env vars above → deploy.

## Important: AI is required for custom destinations

Unlike earlier versions of this app, custom (non-featured) destinations no
longer fall back to Wikipedia/OpenStreetMap — per your request, they're
**fully AI-generated**. This means an AI key isn't optional if you want
custom trips to work; without one, only the 5 curated destinations
(Leh-Ladakh, Kashi, Kashmir, Kerala, Goa) will function, since those use
static curated data with no external calls at all.

**Two provider options — Gemini is checked first:**
- `GEMINI_API_KEY` — genuinely free, no card required. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- `ANTHROPIC_API_KEY` — used only if `GEMINI_API_KEY` isn't set. Requires billing at console.anthropic.com.

## How the app stays honest

- The 5 featured destinations show a **"✓ Curated — hand-researched, not AI-generated"** badge — this content is never touched by AI.
- Custom destinations show a **"✦ AI-suggested"** badge with a reminder to double-check anything important — coordinates and details are AI-estimated, not independently verified.
- Costs are entirely user-entered/editable (full CRUD) — never invented.
- Checklist seeds from curated permit/safety guidance plus generic reminders; add/edit/delete your own items freely.
