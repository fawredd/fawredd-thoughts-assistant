# Requirement Doc: [PIPE-001] Entry Processing Pipeline [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
Implement the server action that handles the entire flow from journal entry submission to AI response streaming.

## Functional Requirements
- Implement `submitJournalEntry` server action.
- Workflow:
  1. Save entry to `entries` table.
  2. Fetch the most recent `user_states` for the user.
  3. Call `updateLifeSnapshot` (State Architect).
  4. Save the new state to `user_states` (increment version).
  5. Log the state update to `state_updates_log`.
  6. Return the `streamText` result from the Psychologist Agent.
- Handle authentication using Clerk.
- Truncate entries at 2000 chars before processing.

## Acceptance Criteria
1. `app/actions/journal.ts` contains the processing logic.
2. Data is scoped by `userId` (from Clerk).
3. The server action correctly updates the database and logs tokens/models.
4. Observability logs are written to `ai_messages_log` for both agents.

## Technical Specs
- **Engine:** Next.js Server Actions
- **Auth:** Clerk `auth()`
- **Concurrency:** Ensure state updates are sequential if possible (or handle version collisions).
