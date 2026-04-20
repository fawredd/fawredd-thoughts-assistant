# Requirement Doc: [INIT-001] Project Infrastructure Setup [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-19

## Context
Initialize the Next.js project with all mandatory stack components: Tailwind CSS, Shadcn UI, Clerk, and Drizzle.

## Functional Requirements
- Initialize Next.js 15+ App Router project (if not already properly initialized).
- Install Tailwind CSS and verify basic configuration.
- Install Shadcn UI and set up the components directory.
- Configure Clerk for authentication (Client/Server settings).
- Set up Drizzle ORM with Neon PostgreSQL connector.
- Define initial folder structure for agents and artifacts.

## Acceptance Criteria
1. `package.json` contains `next`, `tailwindcss`, `@clerk/nextjs`, `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`.
2. Clerk middleware is configured in `src/middleware.ts` (or root).
3. Drizzle configuration file `drizzle.config.ts` exists and points to the schema directory.
4. `.env.local.example` exists with placeholders for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY`
5. Shadcn UI `components.json` exists.
6. The app builds successfully with `npm run build`.

## Technical Specs
- **Next.js:** version 15+
- **CSS:** Tailwind CSS
- **ORM:** Drizzle with Neon
- **Auth:** Clerk SDK v6+
- **Icons:** Lucide React

## UI/UX Considerations
- Minimal setup for now. Just a "Welcome" page with Clerk `<SignIn />` and `<SignUp />` buttons.
