CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`object_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`target_value` real NOT NULL,
	`current_value` real NOT NULL,
	`unit` text NOT NULL,
	`target_date` integer
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`resource_type` text NOT NULL,
	`title` text NOT NULL,
	`annual_impact` real NOT NULL,
	`impact_unit` text NOT NULL,
	`difficulty` text NOT NULL,
	`disruption` text NOT NULL,
	`confidence` real NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resource_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`document_id` text,
	`resource_type` text NOT NULL,
	`category` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`confidence` real,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`reduction_percentage` real NOT NULL,
	`annual_return` real NOT NULL,
	`years` integer NOT NULL
);
