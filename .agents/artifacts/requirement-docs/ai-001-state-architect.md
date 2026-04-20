# Requirement Doc: [AI-001] State Architect & User State Schema [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
Implement the core AI logic to maintain a compressed "Life Snapshot" of the user. This is the "State Architect" agent.

## State Schema (Zod)

```typescript
const UserStateSchema = z.object({
  problems: z.array(z.string().max(120)).max(7),
  objectives: z.array(z.string().max(120)).max(7),
  happyMoments: z.array(z.string().max(120)).max(7),
  socialCircle: z.array(z.object({
    name: z.string().max(120),
    relation: z.string().max(120),
    sentiment: z.enum(["positive", "neutral", "negative", "complex"]),
    context: z.string().max(120),
  })).max(7),
  activities: z.array(z.string().max(120)).max(7),
  psychologicalProfile: z.string().max(240), // max 2 sentences
});
```

## Functional Requirements
- Implement a utility function to call the **State Architect** using `generateObject` from Vercel AI SDK.
- The Architect must merge overlapping items, remove resolved ones, and keep lists short.
- The Architect must NEVER invent facts.
- The Architect must respect hard limits (max 7 items, char limits).

## Acceptance Criteria
1. `lib/ai/state-schema.ts` contains the Zod schema and types.
2. `lib/ai/state-architect.ts` contains the function `updateUserState(previousState, entry)`.
3. System prompt for the Architect is implemented exactly as per Project Spec.
4. Token optimization is considered (total snapshot < 1200 chars).

## Technical Specs
- **Model:** OpenRouter free model (e.g., `google/gemini-2.0-flash-lite-preview-02-05:free`)
- **SDK:** v6+ Vercel AI SDK
