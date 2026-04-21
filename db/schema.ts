import { pgSchema, uuid, text, timestamp, integer, vector } from 'drizzle-orm/pg-core';

export const mySchema = pgSchema("fawredd-ai-thoughts");

export const users = mySchema.table('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    clerkId: text('clerk_id').notNull().unique(),
    language: text('language').default('es').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const entries = mySchema.table('entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 3072 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userStates = mySchema.table('user_states', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    stateJson: text('state_json').notNull(), // Encrypted JSON string
    version: integer('version').default(1).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stateUpdatesLog = mySchema.table('state_updates_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    entryId: uuid('entry_id').notNull(),
    oldStateJson: text('old_state_json'), // Encrypted JSON string
    newStateJson: text('new_state_json').notNull(), // Encrypted JSON string
    tokensUsed: integer('tokens_used'),
    model: text('model'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiMessagesLog = mySchema.table('ai_messages_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    entryId: uuid('entry_id'), // Optional link to an entry
    agentType: text('agent_type').notNull(), // "architect" | "psychologist"
    prompt: text('prompt').notNull(),
    response: text('response').notNull(),
    tokensUsed: integer('tokens_used'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});