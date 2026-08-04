# Self-hosting

## Requirements

- Node.js 22.13 or newer
- A Cloudflare-compatible Workers deployment
- A D1 database bound as `DB`
- A secret named `INGEST_TOKEN`

## Setup

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` for local development and generate a long random ingestion token.
3. Create a D1 database and bind it as `DB` in your deployment configuration.
4. Apply the SQL migrations in `drizzle/` in numeric order.
5. Run `npm run typecheck`, `npm run lint`, and `npm test`.
6. Start locally with `npm run dev`, or build with `npm run build` and deploy through your chosen Workers control plane.
7. Send normalized payloads with `scripts/ingest-normalized.mjs` or an equivalent authenticated client.

The repository intentionally does not ship an account-specific hosting project ID. Your deployment platform should create and manage its own project configuration.

## Production checklist

- Complete legal review for disclosure-source use and commercial posture.
- Contract with a market-data provider for the required display and storage rights.
- Put ingestion behind HTTPS, secret management, rate limiting, payload limits, monitoring, and audit logs.
- Preserve raw filing documents and hashes outside the derived database.
- Schedule backups and test migration recovery.
- Publish coverage and correction methodology.
- Replace illustrative records before claiming live coverage.
