ALTER TABLE "fawredd-ai-thoughts"."entries" ADD COLUMN "embedding" vector(3072);--> statement-breakpoint
ALTER TABLE "fawredd-ai-thoughts"."users" ADD COLUMN "language" text DEFAULT 'es' NOT NULL;