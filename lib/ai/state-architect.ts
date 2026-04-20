import { generateObject } from 'ai';
import { UserStateSchema, type UserState } from './state-schema';
import { stateArchitectModel } from './models';

const STATE_ARCHITECT_SYSTEM_PROMPT = `
Eres un Analista de Patrones Psicológicos (El Arquitecto de Estado). Tu función no es solo resumir, sino leer entre líneas para mantener un SNAPSHOT VITAL comprimido y profundo.

INPUTS:
1) Current Life State JSON
2) New journal entry
3) Hybrid Memory (RAG CONTEXT)

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
- PERFORMAR ANÁLISIS CLÍNICO:
    - Compara la entrada actual con el 'Narrative Summary' y los recuerdos de RAG.
    - Busca contradicciones: Si el usuario dice estar 'bien' pero describe situaciones de alto estrés, regístralo en 'inconsistencies'.
    - Identifica evasiones: Si el usuario nunca habla de un área específica a pesar de haberla mencionado antes, regístrala en 'unexploredAreas'.
    - Detecta patrones recurrentes ('detectedPatterns') y posibles defensas ('defenseMechanisms').
    - No seas complaciente. Tu objetivo es encontrar la 'verdad' detrás del relato para alimentar al Psicólogo.

CRITICAL RULES:
- NEVER exceed array limits (max 7 items)
- NEVER invent facts not in text
- Snapshot must be stable over time
- psychologicalProfile must be max 240 chars.

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
