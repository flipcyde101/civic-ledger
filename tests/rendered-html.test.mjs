import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("produces a deployable Civic Ledger worker", async () => {
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/client/assets/", import.meta.url));
  const [page, dashboard, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/Dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /Civic Ledger \| Congressional market intelligence/);
  assert.match(dashboard, /every visible record and metric is illustrative/i);
  assert.match(dashboard, /Verified beta · live database records/);
  assert.match(dashboard, /Latest disclosed activity/);
  assert.match(dashboard, /Export view/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(page + dashboard + layout, /codex-preview|Your site is taking shape/);
});

test("implements trust, persistence, provenance, and customization boundaries", async () => {
  const [dashboard, packageJson, schema, api, hosting, initialMigration, amendmentMigration] = await Promise.all([
    readFile(new URL("../app/Dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/trades/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.example.json", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_flawless_human_torch.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_shiny_ego.sql", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /localStorage\.setItem\("civic-ledger-watchlist"/);
  assert.match(dashboard, /localStorage\.setItem\("civic-ledger-alerts"/);
  assert.match(dashboard, /Transaction date and public filing date stay separate/);
  assert.match(dashboard, /disclosures-clerk\.house\.gov/);
  assert.match(dashboard, /efdsearch\.senate\.gov/);
  assert.match(packageJson, /"name": "civic-ledger"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  for (const table of ["members", "filings", "transactions", "positions", "priceSnapshots", "statements", "statementAssetLinks", "corrections"]) assert.match(schema, new RegExp(`export const ${table}`));
  assert.match(api, /documentSha256/);
  assert.match(api, /Unauthorized/);
  assert.match(api, /onConflictDoUpdate/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(initialMigration, /CREATE TABLE `transactions`/);
  assert.match(amendmentMigration, /DROP INDEX `idx_transactions_stable_key`/);
  assert.match(amendmentMigration, /idx_transactions_filing_stable_key/);
  assert.match(amendmentMigration, /PRAGMA optimize/);
});
