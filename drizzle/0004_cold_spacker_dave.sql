DROP TABLE `event_settings`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordHash`;