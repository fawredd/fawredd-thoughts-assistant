# Requirement Doc: [UI-004] Refactor Journal Feed for RSC & Streaming Optimization [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2026-04-20

## Context
The current `JournalFeed` component is a monolithic Client Component that lacks entry history and uses incorrect AI streaming patterns. We need to refactor it to leverage React Server Components (RSC) for data fetching and optimize the Client/Server boundary.

## Requirement Details
- **Architecture**:
    - **JournalFeed**: Convert to a Server Component. 
    - **JournalHistory**: New Server Component that fetches past entries from the database (descending order).
    - **JournalComposer**: New Client Component for the entry input and AI response display.
- **Data Fetching**: 
    - Server Component should fetch entries scoped to the authenticated `userId`.
- **Streaming Optimization**:
    - Use `readStreamableValue` from `ai/rsc` on the client.
    - Fix the incorrect `streamText` usage in the client.
- **Interactions**:
    - Submitting a new entry should trigger a revalidation (e.g., `revalidatePath('/')`) in the Server Action to update the history list.

## Acceptance Criteria
1. `components/journal-feed.tsx` is converted to a Server Component.
2. `components/journal-history.tsx` displays past journal entries fetched from the DB.
3. `components/journal-composer.tsx` handles text input, submission, and displays the AI psychologist assistant's reflective response.
4. AI response is streamed correctly using the `ai/rsc` `readStreamableValue` pattern.
5. The UI shows a loading state while "Process Entry" is active.
6. The user question "Is it really necessary for this component to be a client component?" is addressed by moving non-interactive parts to RSC.

## Technical Specs
- **Server Action**: `app/actions/journal.ts` -> `submitJournalEntry`.
- **Database**: `entries` table.
- **SDK**: Vercel AI SDK 3.x/4.x (`ai/rsc`).
