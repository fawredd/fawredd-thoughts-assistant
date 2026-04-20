'use server';

import { db } from '@/db';
import { entries, userStates, stateUpdatesLog, aiMessagesLog } from '@/db/schema';
import { getOrCreateUser } from '@/lib/db-utils';
import { updateLifeSnapshot } from '@/lib/ai/state-architect';
import { DEFAULT_USER_STATE, type UserState } from '@/lib/ai/state-schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { streamText, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { encrypt, encryptJson, decryptJson, decrypt } from '@/lib/encryption';
import { embeddingModel } from '@/lib/ai/models';

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

/** Fetch top-3 semantically similar past entries using cosine distance */
async function retrieveRagContext(userId: string, embedding: number[]): Promise<string[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    // Raw SQL: cosine_distance operator <=>
    const similar = await db.execute<{ content: string; distance: number }>(
        sql`
            SELECT content, embedding <=> ${vectorStr}::vector AS distance
            FROM "fawredd-ai-thoughts"."entries"
            WHERE user_id = ${userId}
              AND embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 3
        `
    );

    // Decrypt and truncate each fragment to keep within token budget (~500 tokens ≈ 350 words ≈ ~2000 chars total for 3 fragments)
    return (similar.rows ?? []).map((row) =>
        decrypt(row.content).slice(0, 600)
    );
}

// ---------------------------------------------------------------------------
// CRUD Actions
// ---------------------------------------------------------------------------

export async function deleteJournalEntry(entryId: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error('Unauthorized');

    await db.delete(entries)
        .where(
            and(
                eq(entries.id, entryId),
                eq(entries.userId, user.id)
            )
        );

    revalidatePath('/');
}

export async function updateJournalEntry(entryId: string, newContent: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error('Unauthorized');

    const truncatedContent = newContent.slice(0, 2000);

    await db.update(entries)
        .set({ content: encrypt(truncatedContent) })
        .where(
            and(
                eq(entries.id, entryId),
                eq(entries.userId, user.id)
            )
        );

    revalidatePath('/');
}

export async function getJournalHistory(offset: number = 0, limit: number = 10) {
    const user = await getOrCreateUser();
    if (!user) throw new Error('Unauthorized');

    const result = await db.query.entries.findMany({
        where: eq(entries.userId, user.id),
        orderBy: [desc(entries.createdAt)],
        limit: limit,
        offset: offset,
    });

    const entryIds = result.map(e => e.id);
    const aiResponses = entryIds.length > 0
        ? await db.select().from(aiMessagesLog).where(
            and(
                eq(aiMessagesLog.userId, user.id),
                eq(aiMessagesLog.agentType, 'psychologist'),
            )
        )
        : [];

    const responseMap = new Map(aiResponses.map(r => [r.entryId, decrypt(r.response)]));

    return result.map(entry => ({
        id: entry.id,
        content: decrypt(entry.content),
        createdAt: entry.createdAt,
        aiResponse: responseMap.get(entry.id) || null
    }));
}

// ---------------------------------------------------------------------------
// Main Journal Pipeline
// ---------------------------------------------------------------------------

export async function submitJournalEntry(content: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Truncate entry
    const truncatedContent = content.slice(0, 2000);

    // 2. Generate embedding (ephemeral — plain text only in Server Action memory)
    const embedding = await generateEmbedding(truncatedContent);

    // 3. Save entry (encrypted) + embedding (plain vector, safe for search)
    const [newEntry] = await db.insert(entries).values({
        userId: user.id,
        content: encrypt(truncatedContent),
        embedding,
    }).returning();

    revalidatePath('/');

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
    const architectResult = await updateLifeSnapshot(currentState, truncatedContent, ragContext);

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

    // 9. Log State Architect call
    await db.insert(aiMessagesLog).values({
        userId: user.id,
        agentType: 'architect',
        prompt: encrypt(truncatedContent),
        response: encryptJson(architectResult.updatedState),
        tokensUsed: architectResult.tokensUsed,
    });

    // 10. Stream Psychologist Response
    const continuityNotes = architectResult.updatedState.continuityNotes ?? '';
    const currentPhase = architectResult.updatedState.timelineContext?.currentPhase ?? '';

    const result = streamText({
        model: google("gemini-3.1-flash-lite-preview"),
        system: `You are an AI Psychologist Assistant.

IMPORTANT DISCLAIMER:
You are NOT a therapist.
You provide reflective coaching and emotional support.

INPUTS:
- Latest Journal Entry
- Current Life Snapshot JSON (includes narrative summary and timeline data)
- Continuity Notes from previous sessions

GOALS:
- Provide ONE deep insight OR ONE powerful reflective question
- Reference the snapshot and narrative continuity naturally
- Avoid repeating facts from the entry
- Prioritize NARRATIVE CONTINUITY — do not sound repetitive or generic
- Be empathetic but intellectually honest
- No generic advice lists
- Max 120 words

CRISIS RULE:
If user shows signs of self-harm:
Encourage seeking professional help gently.

TONE:
Supportive, grounded, insightful colleague.`,
        prompt: `
            CURRENT LIFE SNAPSHOT:
            ${JSON.stringify(architectResult.updatedState, null, 2)}

            CURRENT PHASE: ${currentPhase}
            CONTINUITY NOTES: ${continuityNotes}

            LATEST JOURNAL ENTRY:
            ${truncatedContent}
        `,
        topP: 0.1,
        topK: 20,
    });

    // 11. Log psychologist call placeholder (updated after stream)
    const [logEntry] = await db.insert(aiMessagesLog).values({
        userId: user.id,
        entryId: newEntry.id,
        agentType: 'psychologist',
        prompt: encrypt(`Entry: ${truncatedContent}\nPhase: ${currentPhase}\nSnapshot: ${JSON.stringify(architectResult.updatedState)}`),
        response: encrypt('STREAMING...'),
    }).returning();

    // 12. Tee the stream for background logging
    const [logStream, clientStream] = result.textStream.tee();

    (async () => {
        let fullText = '';
        const reader = logStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += value;
            }
            await db.update(aiMessagesLog)
                .set({ response: encrypt(fullText) })
                .where(eq(aiMessagesLog.id, logEntry.id));
        } catch (error) {
            console.error('Logging stream error:', error);
        } finally {
            reader.releaseLock();
        }
    })();

    return clientStream;
}
