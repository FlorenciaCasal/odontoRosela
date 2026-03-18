CREATE TYPE "public"."calendar_event_link_status" AS ENUM('linked', 'pending_review', 'ambiguous', 'unlinked', 'ignored');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"patient_id" uuid,
	"calendar_event_link_id" uuid,
	"metadata_json" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_event_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_event_id" text NOT NULL,
	"google_calendar_id" text NOT NULL,
	"patient_id" uuid,
	"status" "calendar_event_link_status" DEFAULT 'pending_review' NOT NULL,
	"event_title_snapshot" text,
	"event_start_at" timestamp with time zone,
	"event_end_at" timestamp with time zone,
	"source" text DEFAULT 'apps_script' NOT NULL,
	"match_method" text,
	"match_confidence" integer,
	"manual_review_required" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone,
	"linked_by_user_id" uuid,
	"unlinked_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_calendar_event_link_id_calendar_event_links_id_fk" FOREIGN KEY ("calendar_event_link_id") REFERENCES "public"."calendar_event_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_links" ADD CONSTRAINT "calendar_event_links_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_links" ADD CONSTRAINT "calendar_event_links_linked_by_user_id_users_id_fk" FOREIGN KEY ("linked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_links" ADD CONSTRAINT "calendar_event_links_unlinked_by_user_id_users_id_fk" FOREIGN KEY ("unlinked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_patient_idx" ON "audit_log" USING btree ("patient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "calendar_event_links_calendar_event_unique" ON "calendar_event_links" USING btree ("google_calendar_id","google_event_id");--> statement-breakpoint
CREATE INDEX "calendar_event_links_patient_idx" ON "calendar_event_links" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "calendar_event_links_status_idx" ON "calendar_event_links" USING btree ("status");