import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log('Ensuring pgvector extension...');
        await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

        console.log('Altering embedding column to vector(3072) for gemini-embedding-001...');
        await sql`
            ALTER TABLE "fawredd-ai-thoughts"."entries" 
            DROP COLUMN IF EXISTS "embedding";
        `;
        await sql`
            ALTER TABLE "fawredd-ai-thoughts"."entries" 
            ADD COLUMN "embedding" vector(3072);
        `;
        console.log('Done! Column is now vector(3072).');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
