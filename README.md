# Friction

**Find friction. Fix onboarding.**

Evidence-led onboarding diagnosis for separating observed funnel behavior from hypotheses, missing evidence and recommendations.

## Current production foundation
- persistent repository interface with MongoDB Atlas support and development memory fallback
- owner-scoped analyses and monthly usage limit of 2 analyses
- deterministic funnel validation and uncertainty-aware diagnosis primitives
- AI/vision provider adapter with timeout and structured JSON
- knowledge retrieval boundary
- secure HTTP defaults and input IDs
- report HTML boundary
- module and API integration tests

Credentials are intentionally environment-driven and added later.

## Development
Node.js 20+. `npm install`, then run API and web workspaces.

## Production completion still requires
Real authentication/OAuth, object storage, image upload/vision pipeline, semantic vector retrieval, PDF/Chromium rendering, frontend upload/report UX, observability and deployment wiring.