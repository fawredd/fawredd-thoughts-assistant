import { db } from '@/db';
import { users } from '@/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getOrCreateUser() {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0].emailAddress;

    const [dbUser] = await db
        .insert(users)
        .values({
            clerkId,
            email,
        })
        .onConflictDoUpdate({
            target: users.email, // o users.clerkId si también es unique
            set: {
                clerkId, // asegura sincronización si cambia algo en Clerk
            },
        })
        .returning();

    return dbUser;
}