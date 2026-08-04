# Data sources and methodology

## Official disclosure sources

- House financial disclosure search: <https://disclosures-clerk.house.gov/FinancialDisclosure/ViewSearch>
- Senate electronic financial disclosure search: <https://efdsearch.senate.gov/search/home/>
- House Ethics periodic transaction guidance: <https://ethics.house.gov/periodic-transaction-report-calculator/>

Deployers must review current source notices and obtain legal advice for their intended use. Civic Ledger does not bypass authentication, robots controls, rate limits, or other access restrictions.

## Terminology

- A transaction is a **disclosed transaction**, not necessarily a complete or real-time trade record.
- Dollar amounts are **disclosed or estimated value ranges**, not exact position sizes.
- Transaction date and public filing date remain separate.
- A reconstructed position is a low/high band with a documented method and confidence.
- Amendments and corrections remain visible rather than silently replacing history.

## Prices

Every stored price includes date, currency, provider, retrieval time, and source URL. A production deployment must use a provider whose license covers display, storage, redistribution, and intended audience. “Real time” must only be shown when the provider and exchange terms support it.

## Statements

Statements should come from official press releases, hearings, committee material, or the Congressional Record. Asset links store a match method, evidence text, relevance score, and review flag. An automated match can be useful for discovery but is never presented as proof of knowledge, intent, causation, or wrongdoing.

## Completeness

Coverage claims should report source, chamber, filing types, earliest date, latest successful collection, unresolved failures, and review backlog. A deployment without verified collectors must remain labeled demo or illustrative.
