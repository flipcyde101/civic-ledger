# Contributing to Civic Ledger

Thank you for helping make public financial-disclosure research more transparent and reproducible.

## Before opening a change

1. Search existing issues and open a focused proposal for substantial behavior or schema changes.
2. Keep disclosure language neutral: use “disclosed transaction” and “estimated value range.”
3. Preserve provenance. New normalized fields should identify their source, extraction method, and confidence.
4. Do not submit scraped data, credentials, personal contact information, or content you lack permission to redistribute.
5. Do not claim that a topical match proves intent, causation, wrongdoing, or a trading recommendation.

## Development workflow

```bash
npm ci
npm run typecheck
npm run lint
npm test
```

Create a focused branch, include tests or methodology notes where appropriate, and explain user-visible and data-integrity effects in the pull request. By contributing, you agree that your contribution is licensed under AGPL-3.0-only.

## Data-source changes

Collectors and source adapters need documented permission/terms, rate-limit behavior, idempotency, raw-document preservation, document hashing, amendment handling, and a failure/review path. Access controls are stop signals, not obstacles to bypass.
