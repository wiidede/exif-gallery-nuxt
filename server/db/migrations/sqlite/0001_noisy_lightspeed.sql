PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photos` (
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
	`focal_length` real,
	`focal_length_in_35mm_format` real,
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
INSERT INTO `__new_photos`("id", "file_name", "file_modified", "jpeg", "webp", "avif", "thumbnail", "title", "caption", "semantic_description", "tags", "make", "model", "focal_length", "focal_length_in_35mm_format", "lens_make", "lens_model", "f_number", "iso", "exposure_time", "exposure_compensation", "location_name", "latitude", "longitude", "taken_at", "aspect_ratio", "priority_order", "hidden", "updated_at", "created_at") SELECT "id", "file_name", "file_modified", "jpeg", "webp", "avif", "thumbnail", "title", "caption", "semantic_description", "tags", "make", "model", "focal_length", "focal_length_in_35mm_format", "lens_make", "lens_model", "f_number", "iso", "exposure_time", "exposure_compensation", "location_name", "latitude", "longitude", "taken_at", "aspect_ratio", "priority_order", "hidden", "updated_at", "created_at" FROM `photos`;--> statement-breakpoint
DROP TABLE `photos`;--> statement-breakpoint
ALTER TABLE `__new_photos` RENAME TO `photos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;