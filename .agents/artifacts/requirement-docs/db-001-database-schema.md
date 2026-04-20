# Requirement Doc: [DB-001] Database Schema Design & Migration [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
Define the PostgreSQL schema using Drizzle ORM to support the AI journaling app requirements.

## Database Schema (Drizzle)

### `users`
- `id`: uuid, primary key
- `email`: text, unique
- `clerkId`: text, unique (to link with Clerk)
- `createdAt`: timestamp, default now

### `entries`
- `id`: uuid, primary key
- `userId`: uuid, foreign key to `users.id`
- `content`: text, mandatory (max 2000 chars)
- `createdAt`: timestamp, default now

### `user_states`
- `id`: uuid, primary key
- `userId`: uuid, foreign key to `users.id`
- `state_json`: jsonb (structured per Zod schema)
- `version`: integer, default 1
- `updatedAt`: timestamp, default now

### `state_updates_log`
- `id`: uuid, primary key
- `userId`: uuid
- `entryId`: uuid
- `old_state_json`: jsonb
- `new_state_json`: jsonb
- `tokens_used`: integer
- `model`: text
- `createdAt`: timestamp, default now

### `ai_messages_log`
- `id`: uuid, primary key
- `userId`: uuid
- `agentType`: text ("architect" | "psychologist")
- `prompt`: text
- `response`: text
- `tokens_used`: integer
- `createdAt`: timestamp, default now

## Acceptance Criteria
1. `src/db/schema.ts` accurately represents the tables above.
2. Drizzle migration file is generated via `pnpm drizzle-kit generate`.
3. Schema includes indexes on `userId` fields for performance.
4. `userId` in `entries` and `user_states` has `onDelete: 'cascade'`.

## Technical Specs
- **Database:** Neon (PostgreSQL)
- **ORM:** Drizzle ORM
- **Migration Tool:** Drizzle Kit
