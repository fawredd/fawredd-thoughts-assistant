'use server';

import { db } from '@/db';
import { entries, userStates, stateUpdatesLog, aiMessagesLog } from '@/db/schema';
import { getOrCreateUser } from '@/lib/db-utils';
import { updateLifeSnapshot } from '@/lib/ai/state-architect';
import { DEFAULT_USER_STATE, type UserState } from '@/lib/ai/state-schema';
import { desc, eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { encrypt, encryptJson, decryptJson, decrypt } from '@/lib/encryption';

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
    // Note: In a full implementation, we might want to re-run the architect,
    // but for now we'll just update the text as requested.
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

    // Fetch psychologist responses for these entries
    const entryIds = result.map(e => e.id);
    const aiResponses = entryIds.length > 0
        ? await db.select().from(aiMessagesLog).where(
            and(
                eq(aiMessagesLog.userId, user.id),
                eq(aiMessagesLog.agentType, 'psychologist'),
            )
        )
        : [];

    // Map responses to entries and decrypt
    const responseMap = new Map(aiResponses.map(r => [r.entryId, decrypt(r.response)]));

    return result.map(entry => ({
        id: entry.id,
        content: decrypt(entry.content),
        createdAt: entry.createdAt,
        aiResponse: responseMap.get(entry.id) || null
    }));
}




export async function submitJournalEntry(content: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Truncate entry at 2000 chars
    const truncatedContent = content.slice(0, 2000);

    // 2. Save entry (ENCRYPTED)
    const [newEntry] = await db.insert(entries).values({
        userId: user.id,
        content: encrypt(truncatedContent),
    }).returning();

    // Revalidate the journal feed to show the new entry immediately
    revalidatePath('/');

    // 3. Fetch latest state
    const [latestState] = await db
        .select()
        .from(userStates)
        .where(eq(userStates.userId, user.id))
        .orderBy(desc(userStates.updatedAt))
        .limit(1);

    const currentState = latestState ? (decryptJson(latestState.stateJson as string) as UserState) : DEFAULT_USER_STATE;

    // 4. Call State Architect
    const architectResult = await updateLifeSnapshot(currentState, truncatedContent);

    // 5. Log State update (ENCRYPTED)
    await db.insert(stateUpdatesLog).values({
        userId: user.id,
        entryId: newEntry.id,
        oldStateJson: encryptJson(currentState),
        newStateJson: encryptJson(architectResult.updatedState),
        tokensUsed: architectResult.tokensUsed,
        model: architectResult.model,
    });

    // 6. Save new state (ENCRYPTED)
    await db.insert(userStates).values({
        userId: user.id,
        stateJson: encryptJson(architectResult.updatedState),
        version: (latestState?.version ?? 0) + 1,
    });

    // 7. Log State Architect call (ENCRYPTED)
    await db.insert(aiMessagesLog).values({
        userId: user.id,
        agentType: 'architect',
        prompt: encrypt(truncatedContent),
        response: encryptJson(architectResult.updatedState),
        tokensUsed: architectResult.tokensUsed,
    });

    // 8. Stream Psychologist Response
    const result = streamText({
        model: google("gemini-3.1-flash-lite-preview"),
        system: `You are an AI Psychologist Assistant.

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
Supportive, grounded, insightful colleague.`,
        prompt: `
            CURRENT LIFE SNAPSHOT:
            ${JSON.stringify(architectResult.updatedState, null, 2)}

            LATEST JOURNAL ENTRY:
            ${truncatedContent}
        `,
        topP: 0.1,
        topK: 20,
    });

    // Log the message and get ID to update later
    const [logEntry] = await db.insert(aiMessagesLog).values({
        userId: user.id,
        entryId: newEntry.id,
        agentType: 'psychologist',
        prompt: encrypt(`Entry: ${truncatedContent}\nSnapshot: ${JSON.stringify(architectResult.updatedState)}`),
        response: encrypt('STREAMING...'),
    }).returning();

    // Let's refine the loop placement
    const [logStream, clientStream] = result.textStream.tee();

    // Process logging in background
    (async () => {
        let text = '';
        const reader = logStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                text += value;
            }
            await db.update(aiMessagesLog)
                .set({ response: encrypt(text) })
                .where(eq(aiMessagesLog.id, logEntry.id));
        } catch (error) {
            console.error('Logging stream error:', error);
        } finally {
            reader.releaseLock();
        }
    })();

    return clientStream;
}
