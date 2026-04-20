# Requirement Doc: [RAG-SPEC] Hybrid Memory Implementation

## Title: Hybrid Memory (RAG + Narrative State)
**Status:** [APPROVED]
**Assignee:** Spec Agent
**Priority:** P0

## 1. Objective
Evolve the Fawredd Thoughts Assistant to include episodic memory using RAG (Retrieval-Augmented Generation) and maintain a coherent timeline through updated User State schemas.

## 2. Technical Stack
- **AI Models:** 
  - Text Processing: `gemini-2.5-flash` or `gemini-1.5-pro` (current project models).
  - Embeddings: `gemini-embedding-001`.
- **Database:** Neon (PostgreSQL) with `pgvector`.
- **ORM:** Drizzle ORM.
- **Validation:** Zod.

## 3. Requirements

### 3.1. Infrastructure & Schema (RAG-INIT, RAG-DB)
- **Database Extension:** Enable `pgvector` in the database.
- **Table Extension:**
  - Modify `entries` table: Add `embedding` column of type `vector(768)`.
- **Privacy Flow:** 
  - Embeddings are generated in the Server Action using the raw text (temporarily decrypted if needed).
  - The `embedding` vector is stored in plain format for similarity search.
  - The `content` remains encrypted.

### 3.2. User State Evolution (SCHEMA-002)
Extend `user_states` JSON schema (Zod) to include:
- `narrativeSummary`: (String) A summary of the user's emotional and life evolution.
- `timelineContext`:
  - `currentPhase`: (String) User-defined or AI-detected life stage.
  - `lastMilestone`: (String) Most recent significant event.
- `continuityNotes`: (String) Technical notes for session-to-session continuity.

### 3.3. Processing Pipeline Refactor (RAG-PIPE)
Refactor `journal` Server Action:
1. **Ingest:** Receive entry, decrypt necessary keys.
2. **Embedding Generation:** Call Gemini Embedding API for the current entry text.
3. **Retrieval:** Query DB for top 3 semantically relevant past entries using `cosine_distance` on the `embedding` column.
4. **State Update:**
   - Prompt Architect with: [Previous State] + [RAG Context] + [New Entry].
   - Receive updated JSON state including `narrativeSummary`.
5. **Psicólogo (Response):**
   - Prompt Psychologist with: [New Updated State] + [New Entry].
   - Focus on narrative continuity.
6. **Cierre:**
   - Store New Entry (Encrypted) + Embedding.
   - Store New State (Encrypted).

### 3.4. UI Components (RAG-UI)
- **Indicator:** Add a "Contexto Recuperado" (Context Retrieved) visual indicator in the dashboard.
- **Timeline:** Display `currentPhase` and `narrativeSummary` in the Snapshot Sidebar.
- **Feedback:** Integrate `sonner` for toasted notifications on entry processing.

## 4. Acceptance Criteria
- [ ] `pgvector` extension enabled in DB.
- [ ] `entries` table has `embedding` column.
- [ ] Drizzle migrations successfully applied.
- [ ] Current entry embedding is generated and stored on every new entry.
- [ ] Server Action successfully retrieves 3 relevant fragments.
- [ ] User state updates with `narrativeSummary` and `timelineContext`.
- [ ] System remains functional with encryption/decryption overhead.
- [ ] UI shows the updated narrative and phase.
- [ ] Sonner toasts appear on successful entry/error.

## 5. Security & Privacy
- Decryption only happens in memory in Server Actions.
- Embeddings are stored in the DB but do not contain original text.
- `vector(768)` is the required dimension for `gemini-embedding-001`.
