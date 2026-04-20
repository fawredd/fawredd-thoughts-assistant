ALTER TABLE "fawredd-ai-thoughts"."state_updates_log" ALTER COLUMN "old_state_json" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fawredd-ai-thoughts"."state_updates_log" ALTER COLUMN "new_state_json" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "fawredd-ai-thoughts"."user_states" ALTER COLUMN "state_json" SET DATA TYPE text;