DROP INDEX "user_scoped_unique_slug";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "shares_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `folders` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
CREATE UNIQUE INDEX `user_scoped_unique_slug` ON `rules` (`owner_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `shares_token_unique` ON `shares` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `rules` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `shares` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `shares` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));