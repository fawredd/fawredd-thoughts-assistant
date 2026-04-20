'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db-utils';
import { revalidatePath } from 'next/cache';

export async function updateUserLanguage(language: 'es' | 'en'): Promise<void> {
    if (language !== 'es' && language !== 'en') {
        throw new Error('Invalid language');
    }

    const user = await getOrCreateUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.update(users)
        .set({ language })
        .where(eq(users.clerkId, user.clerkId));

    revalidatePath('/');
}
