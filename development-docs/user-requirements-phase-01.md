
# FULL PROJECT SPEC — AI JOURNAL + PSYCHOLOGIST ASSISTANT (MVP v1)

You are a development team building a production-ready MVP.

Your job is to implement the application exactly as described.  
Do not invent features outside this scope.

---

# 0. PRODUCT SUMMARY

We are building an AI-assisted journaling web app.

Users write journal entries about their life.
AI maintains a compressed "User Life Snapshot" to avoid token explosion.
A second AI acts as a psychologist assistant using the snapshot + latest entry.

Architecture:

User Entry → State Architect → Updated Snapshot → Psychologist Agent → Response

Primary goal: **token efficiency + longitudinal memory**

---

# 1. TECH STACK (MANDATORY)

Frontend:
- Next.js 16 (App Router)
- Server Actions ONLY for business logic
- Tailwind CSS
- Shadcn UI with Theme Selector (custom "Calm Minimal")

Backend:
- Vercel Neon PostgreSQL
- Drizzle ORM
- Vercel AI SDK

AI Models:
- OpenRouter free model (default)
- Gemini-3-Flash-Lite (fallback)

Deployment:
- Vercel

Auth:
- Clerk sdk
- All data MUST be scoped by userId

AI:
- AI sdk - streams always

---

# 2. DATABASE SCHEMA

## users
id (uuid, pk)
email (text)
createdAt (timestamp)

## entries
id (uuid, pk)
userId (fk)
content (text)
createdAt (timestamp)

## user_states
id (uuid, pk)
userId (fk)
state_json (jsonb)
version (int)
updatedAt (timestamp)

## state_updates_log  (for observability)
id (uuid)
userId
entryId
old_state_json
new_state_json
tokens_used
model
createdAt

## ai_messages_log (for debugging)
id
userId
agentType ("architect" | "psychologist")
prompt
response
tokens_used
createdAt

---

# 3. ZOD USER STATE SCHEMA (STRICT)

This schema MUST be used with generateObject().

UserState = {
  problems: string[]
  objectives: string[]
  happyMoments: string[]
  socialCircle: {
    name: string
    relation: string
    sentiment: "positive" | "neutral" | "negative" | "complex"
    context: string
  }[]
  activities: string[]
  psychologicalProfile: string   // max 2 sentences
}

Hard limits:
- max 7 items per array
- max 120 chars per item
- psychologicalProfile max 240 chars

---

# 4. ENTRY PROCESSING PIPELINE

When user submits an entry:

Server Action flow:

1) Save entry
2) Fetch latest user_state (or empty default)
3) Call STATE ARCHITECT (generateObject)
4) Save new user_state (version++)
5) Log diff + tokens
6) Call PSYCHOLOGIST AGENT (streamText)
7) Stream response to UI

If AI fails:
- keep previous state
- still allow psychologist response using old state

---

# 5. STATE ARCHITECT AGENT

Use AI SDK:

generateObject({
  model,
  schema: userStateSchema,
  system,
  prompt
})

SYSTEM PROMPT:

You are the "State Architect".

Your job is to maintain a compressed LIFE SNAPSHOT.

INPUTS:
1) Current Life State JSON
2) New journal entry

GOALS:
- Merge overlapping problems and goals
- Remove resolved items
- Keep lists SHORT and HIGH VALUE
- Avoid duplicates or paraphrase duplicates
- Extract people and update socialCircle
- Extract hobbies and recurring activities
- Keep psychologicalProfile extremely concise

CRITICAL RULES:
- NEVER exceed array limits
- NEVER invent facts not in text
- Prefer updating existing items instead of adding new ones
- Snapshot must be stable over time

Return ONLY the JSON.

---

# 6. PSYCHOLOGIST AGENT

Use:

streamText()

SYSTEM PROMPT:

You are an AI Psychologist Assistant.

IMPORTANT DISCLAIMER:
You are NOT a therapist.
You provide reflective coaching and emotional support.

INPUTS:
- Latest Journal Entry
- Current Life Snapshot JSON

GOALS:
- Provide ONE deep insight OR ONE powerful reflective question
- Reference the snapshot naturally
- Avoid repeating facts from the entry
- Be empathetic but intellectually honest
- No generic advice lists
- Max 120 words

CRISIS RULE:
If user shows signs of self-harm:
Encourage seeking professional help gently.

TONE:
Supportive, grounded, insightful colleague.

---

# 7. UI REQUIREMENTS

- Mobile first. Responsive.

Layout:
- Left: Entry feed
- Right sidebar: Life Snapshot dashboard

Components:
- Journal entry textarea
- Streaming AI response card
- Snapshot cards:
  - Current Problems
  - Objectives
  - Social Circle
  - Activities
  - Psychological profile

Theme:
Create custom Shadcn theme:
- soft gray background
- low contrast
- calming blue accent

---

# 8. TOKEN OPTIMIZATION RULES

- Never send full entry history to AI
- Only send:
  - latest entry
  - latest snapshot
- Hard truncate entries at 2000 chars
- Snapshot size must stay < 1200 chars

---

# 9. OBSERVABILITY

Log every AI call:
- model
- tokens
- prompt
- response
- errors

This is REQUIRED.

---

# 10. FUTURE EXTENSIONS (DO NOT BUILD YET)

- weekly summary agent
- mood detection graph
- RAG memory
- push notifications

Ignore these for MVP.

---
# 11. DEVELOPMENT
- I use pnpm
- for development create a alpine postress db and an alpine redis db in a docker-compose format. Then create .env.local file with required environment variables.

---

# DELIVERABLE

A fully working MVP deployed on Vercel.
