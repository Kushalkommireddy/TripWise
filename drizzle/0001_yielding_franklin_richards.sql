CREATE TABLE "password_reset_codes" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itinerary_items" ALTER COLUMN "source_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_days" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "origin_city" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "ai_travel_notes" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "ai_route_logistics" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "ai_budget_breakdown" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "ai_total_budget_range" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "ai_tips" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_places" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_codes" ADD CONSTRAINT "password_reset_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;