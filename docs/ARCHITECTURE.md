# Architecture

## Runtime

Civic Ledger uses React with Next-compatible Vinext routing and builds to a Cloudflare Worker. Cloudflare D1 is accessed through Drizzle ORM. The browser dashboard can render an explicitly labeled illustrative fallback when the live API/database is unavailable.

## Data flow

```text
official source -> raw archive + hash -> extraction -> normalization
-> validation/review -> D1 ingestion -> read APIs -> dashboard
                                  |-> amendments/corrections
licensed market data -------------|-> price context
official statements --------------|-> relevance links + evidence
```

Collectors are intentionally outside the trusted ingestion boundary. A collector should preserve the raw document, create a stable document identity and SHA-256 hash, normalize records, and submit them through a protected API. The API upserts by official document identity and stable transaction keys so retries do not duplicate records.

## Primary interfaces

- `GET /api/trades`: filters disclosures by ticker, chamber, action, date, and search text.
- `POST /api/trades`: accepts a normalized member, filing, and transaction set with bearer-token authorization.
- `GET /api/context?ticker=...`: returns stored price snapshots and linked official statements.
- `POST /api/context`: ingests a price snapshot or an official statement and its evidence-backed asset links.

## Trust boundaries

The ingestion token is a shared administrative secret. The current beta is suitable as a reference implementation; a large public service should add a gateway, rate limits, actor-specific credentials, audit logs, payload size limits, and background review queues. Browser watchlists are device-local and not synchronized accounts.
