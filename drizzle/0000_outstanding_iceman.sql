CREATE TABLE "checklist_items" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"trip_id" varchar(191) NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"source_url" text,
	"done" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"trip_id" varchar(191) NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"planned_or_actual" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_items" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"trip_day_id" varchar(191) NOT NULL,
	"order" integer NOT NULL,
	"place_name" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"source_url" text NOT NULL,
	"extract" text,
	"estimated_arrival" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "trip_days" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"trip_id" varchar(191) NOT NULL,
	"day_number" integer NOT NULL,
	"date" timestamp
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"title" text NOT NULL,
	"destination" text NOT NULL,
	"destination_lat" double precision,
	"destination_lng" double precision,
	"country_code" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"budget_total" double precision,
	"currency" text DEFAULT 'INR' NOT NULL,
	"travel_style" text,
	"pace" text,
	"interests" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"origin_city" text,
	"passport_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_trip_day_id_trip_days_id_fk" FOREIGN KEY ("trip_day_id") REFERENCES "public"."trip_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_days" ADD CONSTRAINT "trip_days_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;