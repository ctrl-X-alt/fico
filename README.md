# Friction

**Find friction. Fix onboarding.**

Evidence-led onboarding diagnosis: business context + activation definition + funnel + interface evidence, with explicit uncertainty.

## Architecture
- web: Next.js
- api: Express
- core: deterministic diagnosis primitives
- persistence: MongoDB Atlas with an in-memory development fallback
- knowledge: versioned Markdown knowledge base

## Setup
Node.js 20+. Run `npm install`, then start `npm run dev -w apps/api` and `npm run dev -w apps/web`.
Copy `apps/api/.env.example` before adding credentials.

Production requires real authentication, storage, AI/vision, PDF rendering, observability and deployment configuration; this branch prepares the persistence/API foundation without hardcoding secrets.