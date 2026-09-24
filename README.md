# Friction

**Find friction. Fix onboarding.**

Evidence-led onboarding diagnosis: business context + activation definition + funnel evidence + interface evidence → findings, hypotheses, confidence, recommendations, and next evidence.

## Current MVP
- Next.js web app
- Express API
- deterministic funnel/diagnostic core
- structured diagnosis validation and causal-language guardrails
- versioned diagnostic knowledge base
- monthly analysis usage enforcement
- AI-compatible provider and basic retrieval adapters
- report HTML builder
- CI tests

## Environment
Copy `apps/api/.env.example` to `.env`. The app can run with the deterministic core without an AI key; MongoDB, object storage and AI integrations activate when configured.

## Development
```bash
npm install
npm test
npm run dev
```
