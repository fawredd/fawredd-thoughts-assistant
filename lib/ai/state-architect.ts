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
- Keep lists SHORT and HIGH VALUE
- Avoid duplicates or paraphrase duplicates
- Extract people and update socialCircle
- Extract hobbies and recurring activities
- Keep psychologicalProfile extremely concise

CRITICAL RULES:
- NEVER exceed array limits (max 7 items)
- NEVER invent facts not in text
- Prefer updating existing items instead of adding new ones
- Snapshot must be stable over time
- मनोवैज्ञानिक प्रोफाइल (psychologicalProfile) must be max 240 chars.

Return ONLY the JSON matching the schema.
`;

export async function updateLifeSnapshot(currentState: UserState, newEntry: string) {
    try {
        const { object, usage } = await generateObject({
            model: stateArchitectModel,
            schema: UserStateSchema,
            system: STATE_ARCHITECT_SYSTEM_PROMPT,
            prompt: `
CURRENT STATE:
${JSON.stringify(currentState, null, 2)}

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
