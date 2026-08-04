import { sql } from "drizzle-orm";
import { AnySQLiteColumn, index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bioguideId: text("bioguide_id").notNull(),
  fullName: text("full_name").notNull(),
  chamber: text("chamber", { enum: ["House", "Senate"] }).notNull(),
  party: text("party", { enum: ["D", "R", "I"] }).notNull(),
  state: text("state").notNull(),
  district: text("district"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_members_bioguide_id").on(table.bioguideId)]);

export const filings = sqliteTable("filings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source", { enum: ["house", "senate"] }).notNull(),
  sourceDocumentId: text("source_document_id").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id),
  reportType: text("report_type").notNull(),
  filedAt: text("filed_at").notNull(),
  sourceUrl: text("source_url").notNull(),
  documentSha256: text("document_sha256").notNull(),
  amendmentOfId: integer("amendment_of_id").references((): AnySQLiteColumn => filings.id),
  parserVersion: text("parser_version").notNull(),
  parserConfidence: real("parser_confidence").notNull(),
  ingestedAt: text("ingested_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_filings_source_document").on(table.source, table.sourceDocumentId),
  index("idx_filings_member_filed").on(table.memberId, table.filedAt),
]);

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filingId: integer("filing_id").notNull().references(() => filings.id),
  stableKey: text("stable_key").notNull(),
  owner: text("owner").notNull(),
  assetName: text("asset_name").notNull(),
  ticker: text("ticker"),
  assetType: text("asset_type").notNull(),
  action: text("action", { enum: ["Purchase", "Sale", "Exchange"] }).notNull(),
  transactionDate: text("transaction_date").notNull(),
  amountLow: integer("amount_low"),
  amountHigh: integer("amount_high"),
  amountLabel: text("amount_label").notNull(),
  partialSale: integer("partial_sale", { mode: "boolean" }).notNull().default(false),
  tickerConfidence: real("ticker_confidence"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_transactions_filing_stable_key").on(table.filingId, table.stableKey),
  index("idx_transactions_ticker_date").on(table.ticker, table.transactionDate),
  index("idx_transactions_filing").on(table.filingId),
]);

export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => members.id),
  ticker: text("ticker").notNull(),
  assetName: text("asset_name").notNull(),
  asOfDate: text("as_of_date").notNull(),
  valueLow: integer("value_low"),
  valueHigh: integer("value_high"),
  confidence: real("confidence").notNull(),
  method: text("method").notNull(),
  sourceFilingId: integer("source_filing_id").references(() => filings.id),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_positions_member_ticker_asof").on(table.memberId, table.ticker, table.asOfDate),
  index("idx_positions_ticker").on(table.ticker),
]);

export const priceSnapshots = sqliteTable("price_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull(),
  priceDate: text("price_date").notNull(),
  close: real("close").notNull(),
  currency: text("currency").notNull().default("USD"),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  retrievedAt: text("retrieved_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_prices_ticker_date_source").on(table.ticker, table.priceDate, table.source),
  index("idx_prices_ticker_date").on(table.ticker, table.priceDate),
]);

export const statements = sqliteTable("statements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").references(() => members.id),
  speakerName: text("speaker_name").notNull(),
  leadershipRole: text("leadership_role"),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  publishedAt: text("published_at").notNull(),
  sourceType: text("source_type").notNull(),
  sourceUrl: text("source_url").notNull(),
  documentSha256: text("document_sha256").notNull(),
  ingestedAt: text("ingested_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_statements_source_url").on(table.sourceUrl),
  index("idx_statements_member_date").on(table.memberId, table.publishedAt),
]);

export const statementAssetLinks = sqliteTable("statement_asset_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  statementId: integer("statement_id").notNull().references(() => statements.id),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  relevanceScore: real("relevance_score").notNull(),
  matchMethod: text("match_method").notNull(),
  evidence: text("evidence").notNull(),
  reviewed: integer("reviewed", { mode: "boolean" }).notNull().default(false),
}, (table) => [
  uniqueIndex("idx_statement_asset_unique").on(table.statementId, table.ticker),
  index("idx_statement_assets_ticker").on(table.ticker),
]);

export const corrections = sqliteTable("corrections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  fieldName: text("field_name").notNull(),
  previousValue: text("previous_value"),
  correctedValue: text("corrected_value"),
  reason: text("reason").notNull(),
  sourceUrl: text("source_url").notNull(),
  correctedAt: text("corrected_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_corrections_entity").on(table.entityType, table.entityId)]);
