CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`file_name` text NOT NULL,
	`file_modified` integer,
	`jpeg` text,
	`webp` text,
	`avif` text,
	`thumbnail` text,
	`title` text,
	`caption` text,
	`semantic_description` text,
	`tags` text,
	`make` text,
	`model` text,
	`focal_length` integer,
	`focal_length_in_35mm_format` integer,
	`lens_make` text,
	`lens_model` text,
	`f_number` real,
	`iso` integer,
	`exposure_time` real,
	`exposure_compensation` real,
	`location_name` text,
	`latitude` real,
	`longitude` real,
	`taken_at` integer,
	`aspect_ratio` real,
	`priority_order` real,
	`hidden` integer DEFAULT false,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `photo_tags` (
	`photo_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`photo_id`, `tag_id`),
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);