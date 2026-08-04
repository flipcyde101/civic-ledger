# Security policy

## Supported version

Security fixes currently target the latest tagged beta release and the `main` branch.

## Reporting a vulnerability

Please use GitHub’s private vulnerability reporting for this repository when available. Do not include live credentials, sensitive personal information, or exploit public infrastructure while demonstrating an issue. Include affected version, reproduction steps, impact, and a minimal proof of concept.

For ordinary bugs that do not create a confidentiality, integrity, authentication, authorization, or availability risk, use a public issue.

## Deployment responsibilities

- Store `INGEST_TOKEN` in the hosting provider’s secret manager, never in source control.
- Restrict database and deployment credentials to least privilege.
- Validate and rate-limit ingestion at an authenticated edge or gateway for internet-facing deployments.
- Keep framework and runtime dependencies patched.
- Treat external filings, statements, and market data as untrusted input.
- Back up raw source documents and D1 data before migrations.

This policy covers the Civic Ledger codebase, not third-party government websites, data providers, or independently operated deployments.
