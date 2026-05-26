import { google } from '@ai-sdk/google';

// Primary Model
export const stateArchitectModel = google('gemini-3.5-flash');

// Psychologist Agent Model
export const psychologistModel = google('gemini-3.5-flash');

// Embedding Model: Google Gemini Embedding 001
export const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');

// Fallback Model
export const fallbackModel = google('gemini-1.5-flash');
