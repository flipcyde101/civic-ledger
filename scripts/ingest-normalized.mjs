import { readFile } from "node:fs/promises";

const [file, endpoint = process.env.CIVIC_LEDGER_URL] = process.argv.slice(2);
const token = process.env.INGEST_TOKEN;

if (!file || !endpoint || !token) {
  console.error("Usage: INGEST_TOKEN=... CIVIC_LEDGER_URL=https://... node scripts/ingest-normalized.mjs filing.json");
  process.exit(2);
}

const payload = JSON.parse(await readFile(file, "utf8"));
const response = await fetch(new URL("/api/trades", endpoint), {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error(`Ingestion failed (${response.status}): ${await response.text()}`);
  process.exit(1);
}

console.log(await response.text());
