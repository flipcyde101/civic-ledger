CREATE TABLE `corrections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`field_name` text NOT NULL,
	`previous_value` text,
	`corrected_value` text,
	`reason` text NOT NULL,
	`source_url` text NOT NULL,
	`corrected_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_corrections_entity` ON `corrections` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `filings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`source_document_id` text NOT NULL,
	`member_id` integer NOT NULL,
	`report_type` text NOT NULL,
	`filed_at` text NOT NULL,
	`source_url` text NOT NULL,
	`document_sha256` text NOT NULL,
	`amendment_of_id` integer,
	`parser_version` text NOT NULL,
	`parser_confidence` real NOT NULL,
	`ingested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`amendment_of_id`) REFERENCES `filings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_filings_source_document` ON `filings` (`source`,`source_document_id`);--> statement-breakpoint
CREATE INDEX `idx_filings_member_filed` ON `filings` (`member_id`,`filed_at`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bioguide_id` text NOT NULL,
	`full_name` text NOT NULL,
	`chamber` text NOT NULL,
	`party` text NOT NULL,
	`state` text NOT NULL,
	`district` text,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_members_bioguide_id` ON `members` (`bioguide_id`);--> statement-breakpoint
CREATE TABLE `positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`ticker` text NOT NULL,
	`asset_name` text NOT NULL,
	`as_of_date` text NOT NULL,
	`value_low` integer,
	`value_high` integer,
	`confidence` real NOT NULL,
	`method` text NOT NULL,
	`source_filing_id` integer,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_filing_id`) REFERENCES `filings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_positions_member_ticker_asof` ON `positions` (`member_id`,`ticker`,`as_of_date`);--> statement-breakpoint
CREATE INDEX `idx_positions_ticker` ON `positions` (`ticker`);--> statement-breakpoint
CREATE TABLE `price_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`price_date` text NOT NULL,
	`close` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`retrieved_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_prices_ticker_date_source` ON `price_snapshots` (`ticker`,`price_date`,`source`);--> statement-breakpoint
CREATE INDEX `idx_prices_ticker_date` ON `price_snapshots` (`ticker`,`price_date`);--> statement-breakpoint
CREATE TABLE `statement_asset_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` integer NOT NULL,
	`ticker` text NOT NULL,
	`company_name` text NOT NULL,
	`relevance_score` real NOT NULL,
	`match_method` text NOT NULL,
	`evidence` text NOT NULL,
	`reviewed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_statement_asset_unique` ON `statement_asset_links` (`statement_id`,`ticker`);--> statement-breakpoint
CREATE INDEX `idx_statement_assets_ticker` ON `statement_asset_links` (`ticker`);--> statement-breakpoint
CREATE TABLE `statements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer,
	`speaker_name` text NOT NULL,
	`leadership_role` text,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`published_at` text NOT NULL,
	`source_type` text NOT NULL,
	`source_url` text NOT NULL,
	`document_sha256` text NOT NULL,
	`ingested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_statements_source_url` ON `statements` (`source_url`);--> statement-breakpoint
CREATE INDEX `idx_statements_member_date` ON `statements` (`member_id`,`published_at`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filing_id` integer NOT NULL,
	`stable_key` text NOT NULL,
	`owner` text NOT NULL,
	`asset_name` text NOT NULL,
	`ticker` text,
	`asset_type` text NOT NULL,
	`action` text NOT NULL,
	`transaction_date` text NOT NULL,
	`amount_low` integer,
	`amount_high` integer,
	`amount_label` text NOT NULL,
	`partial_sale` integer DEFAULT false NOT NULL,
	`ticker_confidence` real,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`filing_id`) REFERENCES `filings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_transactions_stable_key` ON `transactions` (`stable_key`);--> statement-breakpoint
CREATE INDEX `idx_transactions_ticker_date` ON `transactions` (`ticker`,`transaction_date`);--> statement-breakpoint
CREATE INDEX `idx_transactions_filing` ON `transactions` (`filing_id`);
--> statement-breakpoint
PRAGMA optimize;
