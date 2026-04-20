# Project Architecture - Fawredd Thoughts Assistant

## Technology Stack
- **Frontend:** Next.js 15+ (App Router), Tailwind CSS, Shadcn UI
- **Backend:** Server Actions, Drizzle ORM, Vercel AI SDK
- **Database:** Vercel Neon (PostgreSQL)
- **Auth:** Clerk
- **AI Models:** OpenRouter (Primary), Gemini 1.5 Flash (Fallback)

## Core Pipeline
1. User submits entry via UI.
2. Server Action `processEntry` is triggered.
3. Entry saved to `entries` table.
4. Latest `user_states` fetched.
5. **State Architect** (AI) updates JSON snapshot.
6. New `user_states` saved (versioned).
7. Diff and tokens logged to `state_updates_log`.
8. **Psychologist Agent** (AI) generates response based on entry + snapshot.
9. Response streamed back to UI.
10. AI call logged to `ai_messages_log`.

## Data Flow Diagram
[User Entry] -> [DB: entries]
[DB: user_states] + [New Entry] -> [State Architect] -> [Updated JSON]
[Updated JSON] -> [DB: user_states (new version)]
[Updated JSON] + [New Entry] -> [Psychologist Agent] -> [Streamed Response]
