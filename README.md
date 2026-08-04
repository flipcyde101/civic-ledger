# Civic Ledger

Civic Ledger is an open-source, evidence-first dashboard for researching securities transactions disclosed by members of the United States Congress. It preserves the filing trail, distinguishes transaction dates from public filing dates, follows licensed price snapshots, and links official congressional leadership statements to companies with visible matching evidence. Its schema establishes a foundation for future estimated position-range reconstruction without presenting invented exact holdings.

> **Release status:** `v0.1.0-beta.1` is a feature-rich reference implementation and data foundation. Its built-in records are clearly labeled illustrative. It does not claim to be a live or complete record of Congress until a deployer connects and validates official-source collectors.

![Civic Ledger dashboard](public/og.png)

## Why it is different

- **Evidence before hype:** every production disclosure can retain its official URL, document ID and hash, amendment chain, parser version, and confidence.
- **Two clocks:** transaction date and public filing date are shown separately, including disclosure delay.
- **Position-ready data model:** low/high value-band fields and documented reconstruction rules for future verified position estimates.
- **Price and speech context:** provenance-backed price snapshots plus official statements, relevance scores, matching methods, and review state.
- **Custom research:** member, chamber, ticker, company, committee, action, date, amount, and confidence-oriented filtering concepts.
- **Corrections and amendments:** schema support for append-only corrections and amended filings.
- **Portable stack:** React, Next-compatible Vinext, Cloudflare Workers, D1, Drizzle ORM, and standard HTTP ingestion endpoints.

## Included features

- Responsive search and filtering by member, ticker, company, committee, and chamber
- Device-local ticker watchlist and customizable alert-rule builder
- Disclosure timeline with filing-delay markers and amendment-aware API/schema fields
- Disclosed transaction ranges plus position-reconstruction schema foundations
- Committee-overlap, clustering, unusual-size, and late-filing signal concepts
- Up to 90 stored price observations per selected ticker
- Official leadership statement links with evidence and a no-causation warning
- Read APIs for disclosures and ticker context
- Token-protected, idempotent normalized-ingestion APIs
- D1 migrations for members, filings, transactions, positions, corrections, prices, statements, and statement links
- Example normalized payload and command-line ingestion helper

## Quick start

Requirements: Node.js 22.13 or newer and npm.

```bash
git clone https://github.com/flipcyde101/civic-ledger.git
cd civic-ledger
npm ci
copy .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local`. The dashboard falls back to explicitly labeled illustrative data when D1 is unavailable.

## Validate a checkout

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` includes a production build and product-contract checks. These checks do not prove that a third-party collector is legally permitted, that live data is complete, or that a deployment has been tested in every target environment.

## Database and ingestion

The committed migrations in `drizzle/` define the D1 schema. Bind a D1 database as `DB`, apply the migrations using your hosting platform's D1 migration workflow, and configure a strong `INGEST_TOKEN` secret. Never commit the token.

```bash
node scripts/ingest-normalized.mjs \
  path/to/normalized-filing.json \
  https://your-deployment.example/api/trades
```

See [Self-hosting](docs/SELF-HOSTING.md), [Architecture](docs/ARCHITECTURE.md), and [Data sources and methodology](docs/DATA-SOURCES.md) before connecting live sources.

## Public-data and market-data boundaries

Financial disclosures are delayed public reports, not real-time brokerage records. Production users must validate House and Senate source terms, maintain a news/communications purpose where required, respect access controls, and obtain legal review before commercial use. Real-time or exchange-derived price data requires an appropriately licensed provider. Civic Ledger does not bundle, resell, or grant rights to third-party government documents, market feeds, or linked statements.

Neutral relevance is not evidence of intent, causation, wrongdoing, or inside information. Civic Ledger is informational software and not investment, legal, or financial advice.

## Community

Bug reports and feature proposals are welcome through [GitHub Issues](https://github.com/flipcyde101/civic-ledger/issues). Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the [roadmap](docs/ROADMAP.md) first.

## Copyright and license

Copyright © 2026 flipcyde101.

The code is free software under the [GNU Affero General Public License v3.0 only](LICENSE). You may use, study, modify, and redistribute it under that license. If you run a modified version for users over a network, the AGPL requires that those users be offered the corresponding source. Third-party source data and trademarks remain subject to their own terms.
