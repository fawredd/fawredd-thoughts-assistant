# Requirement Doc: [AI-002] Psychologist Agent & Streaming Logic [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
Implement the Psychologist Agent that provides reflective coaching and emotional support based on the latest entry and the user's life snapshot.

## Functional Requirements
- Implement a utility function to call the **Psychologist Agent** using `streamText` from Vercel AI SDK.
- The Agent must provide ONE deep insight or ONE powerful reflective question.
- The Agent must reference the snapshot naturally.
- The Agent must be empathetic but intellectually honest.
- The Agent must respect the max 120 words limit.
- **Crisis Rule**: Encourage seeking professional help if self-harm signs are present.

## Acceptance Criteria
1. `lib/ai/psychologist-agent.ts` contains the function `streamPsychologistResponse(snapshot, entry)`.
2. System prompt for the Psychologist is implemented exactly as per Project Spec.
3. Response is streamed to allow real-time UI updates.

## Technical Specs
- **Model:** OpenRouter free model
- **SDK:** v6+ Vercel AI SDK
