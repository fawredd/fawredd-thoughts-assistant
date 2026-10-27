"use server";

import { db } from "@/db";
import {
  entries,
  userStates,
  stateUpdatesLog,
  aiMessagesLog,
} from "@/db/schema";
import { getOrCreateUser } from "@/lib/db-utils";
import { updateLifeSnapshot } from "@/lib/ai/state-architect";
import {
  DEFAULT_USER_STATE,
  UserStateSchema,
  type UserState,
} from "@/lib/ai/state-schema";
import { desc, eq, and, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { streamText, embed } from "ai";
//import { google } from '@ai-sdk/google';
import { encrypt, encryptJson, decryptJson, decrypt } from "@/lib/encryption";
import { embeddingModel, stateArchitectModel } from "@/lib/ai/models";
import { createPsychologistInsightStream } from "@/lib/ai/psychologist-insight";
import {
  claimJournalSubmission,
  completeJournalSubmission,
  failJournalSubmission,
  streamFromText,
  waitForJournalSubmission,
} from "@/lib/idempotency";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a 768-dim embedding for the given text using Gemini */
async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

/** Fetch top-3 past entries using cosine distance */
async function retrieveRagContext(
  userId: string,
  embedding: number[],
): Promise<string[]> {
  const vectorStr = `[${embedding.join(",")}]`;

  const [recentResult, similarResult, historicalResult] = await Promise.all([
    // Most recent entry for continuity
    db.execute<{ content: string }>(
      sql`
                SELECT content
                FROM "fawredd-ai-thoughts"."entries"
                WHERE user_id = ${userId}
                  AND embedding IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 1
            `,
    ),
    // Semantically similar entry for thematic pattern
    db.execute<{ content: string }>(
      sql`
                SELECT content
                FROM "fawredd-ai-thoughts"."entries"
                WHERE user_id = ${userId}
                  AND embedding IS NOT NULL
                ORDER BY embedding <=> ${vectorStr}::vector ASC
                LIMIT 1
            `,
    ),
    // Older entry for historical perspective
    db.execute<{ content: string }>(
      sql`
                SELECT content
                FROM "fawredd-ai-thoughts"."entries"
                WHERE user_id = ${userId}
                  AND embedding IS NOT NULL
                  AND created_at < NOW() - INTERVAL '30 days'
                ORDER BY RANDOM()
                LIMIT 1
            `,
    ),
  ]);

  return [
    ...(recentResult.rows ?? []),
    ...(similarResult.rows ?? []),
    ...(historicalResult.rows ?? []),
  ]
    .filter(
      (row, index, self) =>
        self.findIndex((r) => r.content === row.content) === index,
    )
    .map((row) => decrypt(row.content).slice(0, 600));
}

// ---------------------------------------------------------------------------
// CRUD Actions
// ---------------------------------------------------------------------------

export async function deleteJournalEntry(entryId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(entries)
    .where(and(eq(entries.id, entryId), eq(entries.userId, user.id)));

  revalidatePath("/");
}

export async function updateJournalEntry(entryId: string, newContent: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  const truncatedContent = newContent.slice(0, 2000);
  // 2. Generate embedding (ephemeral — plain text only in Server Action memory)
  const embedding = await generateEmbedding(truncatedContent);

  // 3. Save entry (encrypted) + embedding (plain vector, safe for search)
  const [updatedEntry] = await db
    .update(entries)
    .set({ content: encrypt(truncatedContent), embedding: embedding })
    .where(and(eq(entries.id, entryId), eq(entries.userId, user.id)))
    .returning();

  revalidatePath("/");
}

export async function getJournalHistory(
  offset: number = 0,
  limit: number = 10,
) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db.query.entries.findMany({
    where: eq(entries.userId, user.id),
    orderBy: [desc(entries.createdAt)],
    limit: limit,
    offset: offset,
  });

  const entryIds = result.map((e) => e.id);
  const aiResponses =
    entryIds.length > 0
      ? await db
          .select()
          .from(aiMessagesLog)
          .where(
            and(
              eq(aiMessagesLog.userId, user.id),
              eq(aiMessagesLog.agentType, "psychologist"),
              inArray(aiMessagesLog.entryId, entryIds),
            ),
          )
          .orderBy(desc(aiMessagesLog.createdAt))
      : [];

  const responseMap = new Map<string, string>();
  for (const response of aiResponses) {
    if (response.entryId && !responseMap.has(response.entryId)) {
      responseMap.set(response.entryId, decrypt(response.response));
    }
  }

  return result.map((entry) => {
    const hasResponseRecord = responseMap.has(entry.id);
    const response = responseMap.get(entry.id);
    const normalizedResponse = response?.trim();
    const aiResponsePending =
      hasResponseRecord &&
      (!normalizedResponse || normalizedResponse === "STREAMING...");

    return {
      id: entry.id,
      content: decrypt(entry.content),
      createdAt: entry.createdAt,
      aiResponse: aiResponsePending || !response ? null : response,
      aiResponsePending,
    };
  });
}

// ---------------------------------------------------------------------------
// Insert Journal Pipeline
// ---------------------------------------------------------------------------

function persistInsightStream(
  textStream: ReadableStream<string>,
  logEntryId: string,
  submission?: { key: string; entryId: string },
) {
  const reader = textStream.getReader();
  let fullText = "";
  let readerReleased = false;
  const releaseReader = () => {
    if (readerReleased) return;
    reader.releaseLock();
    readerReleased = true;
  };

  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (!done) {
          fullText += value;
          controller.enqueue(value);
          return;
        }

        if (!fullText.trim()) {
          throw new Error("The AI returned an empty insight");
        }

        await db
          .update(aiMessagesLog)
          .set({ response: encrypt(fullText) })
          .where(eq(aiMessagesLog.id, logEntryId));

        if (submission) {
          await completeJournalSubmission(
            submission.key,
            fullText,
            submission.entryId,
          );
        }

        controller.close();
        releaseReader();
      } catch (error) {
        try {
          if (submission) {
            await failJournalSubmission(submission.key, error);
          }
        } catch (failureError) {
          console.error("Failed to record insight stream failure:", failureError);
        }
        controller.error(error);
        releaseReader();
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
      releaseReader();
      if (submission) {
        await failJournalSubmission(
          submission.key,
          new Error("The insight stream was cancelled"),
        );
      }
    },
  });
}

export async function retryJournalInsight(entryId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.userId, user.id)))
    .limit(1);
  if (!entry) throw new Error("Journal entry not found");

  const [stateUpdate] = await db
    .select()
    .from(stateUpdatesLog)
    .where(
      and(
        eq(stateUpdatesLog.entryId, entry.id),
        eq(stateUpdatesLog.userId, user.id),
      ),
    )
    .orderBy(desc(stateUpdatesLog.createdAt))
    .limit(1);
  if (!stateUpdate) throw new Error("Insight context is unavailable");

  const [logEntry] = await db
    .select()
    .from(aiMessagesLog)
    .where(
      and(
        eq(aiMessagesLog.entryId, entry.id),
        eq(aiMessagesLog.userId, user.id),
        eq(aiMessagesLog.agentType, "psychologist"),
      ),
    )
    .orderBy(desc(aiMessagesLog.createdAt))
    .limit(1);
  if (!logEntry) throw new Error("Insight record not found");

  const existingResponse = decrypt(logEntry.response);
  const normalizedResponse = existingResponse.trim();
  if (normalizedResponse && normalizedResponse !== "STREAMING...") {
    return streamFromText(existingResponse);
  }

  const parsedState = UserStateSchema.safeParse(
    decryptJson(stateUpdate.newStateJson),
  );
  if (!parsedState.success) {
    throw new Error("Saved insight context is invalid");
  }

  await db
    .update(aiMessagesLog)
    .set({ response: encrypt("STREAMING...") })
    .where(eq(aiMessagesLog.id, logEntry.id));

  const language = user.language === "en" ? "en" : "es";
  const recentOpenings = (await getJournalHistory(1, 4)).map((historyEntry) =>
    historyEntry.aiResponse?.slice(0, 20),
  );
  const result = createPsychologistInsightStream({
    state: parsedState.data,
    journalEntry: decrypt(entry.content),
    language,
    recentOpenings,
  });

  return persistInsightStream(result.textStream, logEntry.id);
}

export async function submitJournalEntry(
  content: string,
  idempotencyKey: string,
) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  const { claimed, key } = await claimJournalSubmission(
    user.id,
    idempotencyKey,
  );
  if (!claimed) {
    const existing = await waitForJournalSubmission(key);
    return streamFromText(existing.response || "");
  }

  try {
    // 1. Truncate entry
    const truncatedContent = content.slice(0, 2000);

    // 2. Generate embedding (ephemeral — plain text only in Server Action memory)
    const embedding = await generateEmbedding(truncatedContent);

    // 3. Save entry (encrypted) + embedding (plain vector, safe for search)
    const [newEntry] = await db
      .insert(entries)
      .values({
        userId: user.id,
        content: encrypt(truncatedContent),
        embedding,
      })
      .returning();

    // 4. Fetch latest user state
    const [latestState] = await db
      .select()
      .from(userStates)
      .where(eq(userStates.userId, user.id))
      .orderBy(desc(userStates.updatedAt))
      .limit(1);

    const currentState = latestState
      ? (decryptJson(latestState.stateJson as string) as UserState)
      : DEFAULT_USER_STATE;

    // 5. RAG: Retrieve 3 most relevant past entries
    const ragContext = await retrieveRagContext(user.id, embedding);

    // 6. State Architect — update snapshot with RAG context
    const architectResult = await updateLifeSnapshot(
      currentState,
      truncatedContent,
      ragContext,
    );

    // 7. Log State update (encrypted)
    await db.insert(stateUpdatesLog).values({
      userId: user.id,
      entryId: newEntry.id,
      oldStateJson: encryptJson(currentState),
      newStateJson: encryptJson(architectResult.updatedState),
      tokensUsed: architectResult.tokensUsed,
      model: architectResult.model,
    });

    // 8. Save new state (encrypted)
    await db.insert(userStates).values({
      userId: user.id,
      stateJson: encryptJson(architectResult.updatedState),
      version: (latestState?.version ?? 0) + 1,
    });

    //8.1 retrieve las 3 ai responses phrase starts to include in next prompt and let ai choose how to starts new phrase
    const recentAIResponsesStartings =
      (await getJournalHistory(1, 4)).map((entry) =>
        entry.aiResponse?.slice(0, 20),
      ) || [];

    // 9. Log State Architect call
    await db.insert(aiMessagesLog).values({
      userId: user.id,
      agentType: "architect",
      prompt: encrypt(truncatedContent),
      response: encryptJson(architectResult.updatedState),
      tokensUsed: architectResult.tokensUsed,
    });

    // 10. Stream Psychologist Response
    const continuityNotes = architectResult.updatedState.continuityNotes ?? "";
    const currentPhase =
      architectResult.updatedState.timelineContext?.currentPhase ?? "";
    const language = (user.language as "es" | "en") || "es";
    const languageDirective = `
RESPONSE LANGUAGE:
The user writes in ${language.toUpperCase()}. Always respond in ${language.toUpperCase()}.
${language === "es" ? "Responde siempre en español." : "Always respond in English."}
`;

    const result = streamText({
      model: stateArchitectModel,
      system: `---
You are Fawredd Thoughts, an AI Reflective Behavioral Coach.

Help the user understand recurring patterns and, when useful, turn insight into intentional behavioral change. You are not a therapist: do not diagnose, treat, or provide clinical advice.

APPROACH:
- Reflect when the user needs understanding or perspective.
- Coach when a recurring pattern, stuck behavior, intention/action gap, or explicit desire for change makes action useful.
- When awareness alone is not producing change, challenge the pattern and help test a different behavior.
- Choose ONE: insight, question, gentle challenge, behavioral observation, experiment, or next step.
- Do not force action.

FOCUS:
Look for gaps between intentions and behavior, values and choices, goals and behavior, explanations and observable patterns, and short-term comfort and long-term priorities.

Use longitudinal signals as hypotheses, not facts. Never assume motives or diagnoses. Challenge gently and with uncertainty ("I wonder whether...", "Could it be...").

COACHING:
When action is appropriate, propose ONE small, realistic, observable behavioral experiment directly connected to a recurring pattern. Frame it as an experiment, never a prescription. Avoid generic advice, long plans, or multiple recommendations.

INPUTS:
- Latest Journal Entry
- Current Life Snapshot
- Continuity Notes
- Longitudinal Psychological Signals

SIGNALS:
Patterns: ${architectResult.updatedState.detectedPatterns}
Inconsistencies: ${architectResult.updatedState.inconsistencies}
Defense mechanisms: ${architectResult.updatedState.defenseMechanisms}
Unexplored areas: ${architectResult.updatedState.unexploredAreas}

REQUIREMENTS:
- Ground the response in at least one signal, recurring pattern, inconsistency, or current tension.
- Do not summarize or repeat the journal.
- Recognize genuine progress specifically when supported by the history.
- Maximum 150 words.
- Vary the opening from:
  ${recentAIResponsesStartings}

SAFETY:
If the user shows signs of imminent self-harm, suicide, or immediate danger, prioritize safety and encourage immediate professional/emergency support. Do not continue normal coaching.

TONE:
Empathetic, calm, direct, curious, intellectually honest. Not clinical, motivational, preachy, or robotic.

---
${languageDirective}
---`,
      prompt: ` <CURRENT LIFE SNAPSHOT> ${JSON.stringify(architectResult.updatedState, null, 2)}</CURRENT LIFE SNAPSHOT> 
                <CURRENT PHASE> ${currentPhase}</CURRENT PHASE> 
                <CONTINUITY NOTES> ${continuityNotes}</CONTINUITY NOTES> 
                <LATEST JOURNAL ENTRY> ${truncatedContent}</LATEST JOURNAL ENTRY> `,
      topP: 0.9,
      topK: 40,
    });

    // 11. Log psychologist call placeholder (updated after stream)
    const [logEntry] = await db
      .insert(aiMessagesLog)
      .values({
        userId: user.id,
        entryId: newEntry.id,
        agentType: "psychologist",
        prompt: encrypt(
          `Entry: ${truncatedContent}\nPhase: ${currentPhase}\nSnapshot: ${JSON.stringify(architectResult.updatedState)}`,
        ),
        response: encrypt("STREAMING..."),
      })
      .returning();

    return persistInsightStream(result.textStream, logEntry.id, {
      key,
      entryId: newEntry.id,
    });
  } catch (error) {
    await failJournalSubmission(key, error);
    throw error;
  }
}
