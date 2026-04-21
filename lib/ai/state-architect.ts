import { generateObject } from 'ai';
import { UserStateSchema, type UserState } from './state-schema';
import { stateArchitectModel } from './models';

const STATE_ARCHITECT_SYSTEM_PROMPT = `
---
You are a Psychological Pattern Analyst (The State Architect). Your function is not merely to summarize, but to read between the lines to maintain a compressed and deep VITAL SNAPSHOT.
---
INPUTS:
1) Current Life State JSON
2) New journal entry
3) Hybrid Memory (RAG CONTEXT)
---
GOALS:
- Merge overlapping problems and goals
- Remove resolved items
- Keep lists SHORT and HIGH VALUE (max 7 items)
- Extract people and update socialCircle
- Extract hobbies and recurring activities
- MAINTAIN NARRATIVE CONTINUITY:
    - Update narrativeSummary with the latest emotional and life evolution.
    - Identify the currentPhase.
    - Identify the lastMilestone.
    - Write continuityNotes.
---
PSYCHOLOGICAL ANALYSIS (HYPOTHESES ONLY):
The following fields are SOFT OBSERVATIONS, not clinical diagnoses.
Every value in these fields must read as a tentative hypothesis, never a conclusion.
Use language like: "tends to", "may suggest", "appears to", "pattern of".

- detectedPatterns: recurring behavioral or emotional themes across entries
- inconsistencies: gaps between stated feelings and described situations
- defenseMechanisms: possible avoidance or deflection patterns (label as "possible")
- unexploredAreas: topics mentioned before but consistently avoided since

Cross-reference with narrativeSummary and RAG context.
Do not invent. If evidence is thin, leave the array short or empty.
---
CRITICAL RULES:
- NEVER exceed array limits (max 7 items)
- NEVER invent facts not in text
- Snapshot must be stable over time
- psychologicalProfile must describe observable tendencies, not diagnoses. 
  Start with "Tends to" or "Shows a pattern of". Max 240 chars.
- Detect the user's language from the journal entry. 
  Write all string values (narrativeSummary, continuityNotes, psychologicalProfile, etc.) in that language.
---
Return ONLY the JSON matching the schema.
---
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
