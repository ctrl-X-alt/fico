# Friction

**Find friction. Fix onboarding.**

Evidence-led onboarding diagnosis for separating observed funnel behavior from hypotheses, missing evidence and recommendations.

## Production foundation
- MongoDB Atlas persistence with owner-scoped records and atomic monthly quota reservations/refunds
- private object-storage adapter with local development fallback, upload size/type/signature validation
- deterministic diagnostic pipeline that treats drops as signals and preserves uncertainty
- screenshot vision stage fused into diagnosis before reasoning
- isolated, untrusted-data prompt boundary and bounded AI retries/timeouts
- HttpOnly session authentication path and private report delivery
- rate limiting, readiness checks, request IDs and secure HTTP defaults
- dynamic HTML report and Playwright PDF rendering
- unit, integration and scenario evaluation coverage

Credentials remain environment-driven and are intentionally not committed.

## Run
Node.js 20+. Install dependencies, then run the API and web workspaces.

## Required production environment
See `apps/api/.env.example`. Production requires MongoDB, authentication secrets, an AI provider, and object storage credentials.