import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
    schema: './db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    schemaFilter: ['fawredd-ai-thoughts'],
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
