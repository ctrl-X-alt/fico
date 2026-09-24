# Friction

**Find friction. Fix onboarding.**

Evidence-led onboarding diagnosis for separating observed funnel behavior from hypotheses, missing evidence and recommendations.

## Production foundation

- MongoDB Atlas persistence with owner-scoped records, atomic usage reservations/refunds, expired reservation recovery, and distributed analysis leases
- S3-compatible private object storage (including Cloudflare R2) through the AWS SDK; local storage is development-only
- bounded screenshot ingestion with file signatures, size limits, and image pixel limits
- deterministic diagnostic pipeline with explicit uncertainty states
- screenshot vision fused into diagnosis before reasoning
- structured AI output validation with evidence-reference checks
- prompt-injection-resistant evidence boundaries
- MongoDB Atlas Vector Search knowledge retrieval with embedding ingestion and lexical fallback for local/development operation
- authenticated request throttling, secure HTTP defaults, request IDs, structured redacted logs, readiness checks, and graceful shutdown
- bounded concurrent Playwright PDF rendering
- unit and integration coverage for storage, quota, leases, schema validation, prompt injection, vision degradation, diagnosis, RAG, security, and reports

## Knowledge index

Production vector retrieval requires an Atlas Vector Search index matching the configured KNOWLEDGE_VECTOR_INDEX over the knowledge_chunks.embedding field. Populate it with:

    node scripts/index-knowledge.js

The command uses KNOWLEDGE_ROOT as the source and the configured embedding provider.

## Run

Node.js 20+. Install dependencies, then run the API and web workspaces.

## Required production environment

See apps/api/.env.example. Production requires MongoDB Atlas, Google OAuth credentials, an auth secret, an AI provider, a configured vector index, and S3-compatible object storage.

Credentials remain environment-driven and are intentionally not committed.
