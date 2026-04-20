import { z } from 'zod';

export const UserStateSchema = z.object({
    problems: z.array(z.string().max(120)).max(7).describe('Current life problems or stressors'),
    objectives: z.array(z.string().max(120)).max(7).describe('Current goals or things the user is working towards'),
    happyMoments: z.array(z.string().max(120)).max(7).describe('Recent positive events or things the user is grateful for'),
    socialCircle: z.array(z.object({
        name: z.string().max(120),
        relation: z.string().max(120),
        sentiment: z.enum(["positive", "neutral", "negative", "complex"]),
        context: z.string().max(120),
    })).max(7).describe('Important people in the user\'s life and their current relationship dynamic'),
    activities: z.array(z.string().max(120)).max(7).describe('Recurring hobbies, habits, or daily activities'),
    psychologicalProfile: z.string().max(240).describe('A 1-2 sentence summary of the user\'s current mental state or recurring patterns'),
});

export type UserState = z.infer<typeof UserStateSchema>;

export const DEFAULT_USER_STATE: UserState = {
    problems: [],
    objectives: [],
    happyMoments: [],
    socialCircle: [],
    activities: [],
    psychologicalProfile: 'Initializing profile based on first entry.',
};
