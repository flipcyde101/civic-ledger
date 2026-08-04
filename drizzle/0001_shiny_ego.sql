DROP INDEX `idx_transactions_stable_key`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_transactions_filing_stable_key` ON `transactions` (`filing_id`,`stable_key`);
--> statement-breakpoint
PRAGMA optimize;
