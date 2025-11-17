CREATE TABLE `meals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`meal_name` text NOT NULL,
	`meal_type` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fats` real NOT NULL,
	`items` text NOT NULL,
	`alternatives` text,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`entry_type` text NOT NULL,
	`value` real NOT NULL,
	`notes` text,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`reminder_type` text NOT NULL,
	`enabled` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`calories_goal` integer,
	`protein_goal` integer,
	`carbs_goal` integer,
	`fats_goal` integer,
	`weight_goal` real,
	`fitness_level` text,
	`allergies` text,
	`dietary_preferences` text,
	`workout_time_available` integer,
	`equipment_available` text,
	`injuries` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`workout_name` text NOT NULL,
	`workout_type` text NOT NULL,
	`focus_area` text NOT NULL,
	`difficulty` text NOT NULL,
	`duration` integer NOT NULL,
	`exercises` text NOT NULL,
	`completed` integer DEFAULT false,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
