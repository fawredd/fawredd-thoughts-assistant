import { streamText } from 'ai';
import { type UserState } from './state-schema';
import { psychologistModel } from './models';

const PSYCHOLOGIST_SYSTEM_PROMPT = `
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
`;

export async function streamPsychologistResponse(snapshot: UserState, latestEntry: string) {
    const result = await streamText({
        model: psychologistModel,
        system: PSYCHOLOGIST_SYSTEM_PROMPT,
        prompt: `
CURRENT LIFE SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

LATEST JOURNAL ENTRY:
${latestEntry}
    `,
        topP: 0.1,
        topK: 20,
    });

    return result;
}
