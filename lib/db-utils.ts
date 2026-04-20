import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getOrCreateUser() {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (existingUser) return existingUser;

    const user = await currentUser();
    if (!user) return null;

    const [newUser] = await db.insert(users).values({
        clerkId: clerkId,
        email: user.emailAddresses[0].emailAddress,
    }).returning();

    return newUser;
}
