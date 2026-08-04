# Civic Ledger product blueprint

## Positioning

Most congressional trade trackers compete on the same feed. Civic Ledger should compete on trust, context, and customization: a filing-first intelligence product where users can inspect the source, understand the disclosure lag, and create precise monitoring rules.

## Defensible advantages

1. **Evidence chain:** original document, immutable file hash, parsed fields, corrections, amendments, and extraction confidence on every record.
2. **Two-clock performance:** show performance from the transaction date and separately from the date the disclosure became public. Never imply a user could have acted before publication.
3. **Position reconstruction:** combine annual disclosures, PTRs, amendments, partial sales, spouse/dependent ownership, and value ranges into low/high portfolio bands rather than invented exact positions.
4. **Conflict context:** connect members to committees, bill sponsorship, votes, earmarks, lobbying, contracts, and regulated industries, with neutral methodology and visible source citations.
5. **Anomaly signals:** identify behavior that differs from a member's own history, bipartisan clusters, sector rotations, unusual transaction sizes, deadline proximity, and repeated amendments.
6. **User-defined intelligence:** alerts built from member, ticker, issuer, committee, sector, amount band, transaction type, owner, delay, confidence, and signal thresholds.
7. **Quality operations:** duplicate detection, issuer resolution, parser confidence, human review, source outages, and a public correction log.

## Core records

- `members`: bioguide ID, chamber, party, state/district, term dates
- `committees`: Congress, chamber, committee/subcommittee, membership dates
- `filings`: source, document ID, URL, filer, type, filed date, hash, amendment parent
- `transactions`: filing, owner, asset text, ticker/identifier, action, transaction date, amount range, partial-sale flag, parser confidence
- `positions`: member, asset, as-of date, low/high value band, reconstruction method, confidence
- `market_prices`: identifier, date/time, adjusted close, vendor
- `statements` and `statement_asset_links`: official source, speaker/leadership role, document hash, company/ticker relevance, evidence, review state
- `signals`: type, score, methodology version, evidence references
- `watchlists` and `alerts`: user-owned rules and notification state
- `corrections`: old value, new value, reason, source, timestamp

## Pipeline

`official source → document archive → extraction → normalization → validation → amendment merge → position bands → licensed price snapshots + official statement links → contextual joins → signals → alerts`

Collectors should be idempotent. Parsed records should never overwrite raw documents. Every transformed field needs provenance, and uncertain ticker matches should enter a review queue rather than silently publishing.

## Launch sequence

- **Phase 1 — Verified ledger:** House and Senate filings, source documents, search, member/ticker pages, delay metrics, corrections.
- **Phase 2 — Personal intelligence:** watchlists, saved views, email/push alerts, exports, portfolio bands.
- **Phase 3 — Context engine:** committees, legislation, contracts, lobbying, sector clusters, anomaly scoring.
- **Phase 4 — Research platform:** API, backtesting from public filing time, notebooks, team workspaces, methodology audits.

## Non-negotiable language

- Say “disclosed transaction,” not “real-time trade.”
- Say “estimated value range,” not exact holding value.
- Separate trade date from public filing date everywhere.
- Label illustrative, estimated, inferred, amended, and low-confidence data.
- Do not frame a signal as a recommendation to buy or sell.
