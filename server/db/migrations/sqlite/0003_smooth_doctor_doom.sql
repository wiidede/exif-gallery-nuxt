CREATE INDEX IF NOT EXISTS `idx_photos_taken_at` ON `photos` (`taken_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_photos_hidden` ON `photos` (`hidden`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_photos_priority_order` ON `photos` (`priority_order`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_photo_tags_photo_id` ON `photo_tags` (`photo_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_photo_tags_tag_id` ON `photo_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_tags_photo_count` ON `tags` (`photo_count`);