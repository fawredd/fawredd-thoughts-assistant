import { generateObject } from 'ai';
import { UserStateSchema, type UserState } from './state-schema';
import { stateArchitectModel } from './models';

const STATE_ARCHITECT_SYSTEM_PROMPT = `
You are the "State Architect".

Your job is to maintain a compressed LIFE SNAPSHOT.

INPUTS:
1) Current Life State JSON
2) New journal entry

GOALS:
- Merge overlapping problems and goals
- Remove resolved items
- Keep lists SHORT and HIGH VALUE (max 7 items)
- Extract people and update socialCircle
- Extract hobbies and recurring activities
- MAINTAIN NARRATIVE CONTINUITY:
    - Update narrativeSummary with the latest emotional and life evolution.
    - Identify the currentPhase (e.g., "Crisis", "Growth", "Post-X event").
    - Identify the lastMilestone.
    - Write continuityNotes to help the psychologist maintain context from previous sessions.

CRITICAL RULES:
- NEVER exceed array limits (max 7 items)
- NEVER invent facts not in text
- Snapshot must be stable over time
- psychologicalProfile must be max 240 chars.
- Use the RAG CONTEXT to find patterns and maintain narrative coherence across time.

Return ONLY the JSON matching the schema.
`;


export async function updateLifeSnapshot(currentState: UserState, newEntry: string, ragContext: string[] = []) {
    try {
        const { object, usage } = await generateObject({
            model: stateArchitectModel,
            schema: UserStateSchema,
            system: STATE_ARCHITECT_SYSTEM_PROMPT,
            prompt: `
CURRENT STATE:
${JSON.stringify(currentState, null, 2)}

HYBRID MEMORY (RAG CONTEXT):
${ragContext.length > 0 ? ragContext.join('\n---\n') : 'No prior relevant context.'}

NEW ENTRY:
${newEntry}
      `,
        });

        return {
            updatedState: object,
            tokensUsed: usage.totalTokens,
            model: stateArchitectModel.modelId,
        };
    } catch (error) {
        console.error('State Architect Error:', error);
        // Return the old state as fallback to avoid breaking the pipeline
        return {
            updatedState: currentState,
            tokensUsed: 0,
            model: stateArchitectModel.modelId,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
