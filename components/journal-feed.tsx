import { getOrCreateUser } from '@/lib/db-utils';
import { JournalHistory } from './journal-history';
import { JournalComposer } from './journal-composer';
import { db } from '@/db';
import { userStates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Activity, Users, Target } from 'lucide-react';
import { decryptJson } from '@/lib/encryption';
import { type UserState } from '@/lib/ai/state-schema';

export async function JournalFeed() {
    const user = await getOrCreateUser();

    if (!user) return null;

    // Fetch latest state
    const [latestState] = await db
        .select()
        .from(userStates)
        .where(eq(userStates.userId, user.id))
        .orderBy(desc(userStates.updatedAt))
        .limit(1);

    const snapshot = latestState ? (decryptJson(latestState.stateJson as string) as UserState) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] h-full max-w-6xl mx-auto p-4 gap-12">
            {/* Left: Main Feed */}
            <main className="space-y-12">
                <header className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Sparkles className="h-5 w-5" />
                        <span className="tracking-tight text-lg uppercase">Mind Mirror</span>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tighter text-foreground decoration-primary/20 decoration-8 underline-offset-4">
                        Deep Journaling
                    </h1>
                    <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl">
                        A peaceful space to capture your thoughts and let the AI architect your personal growth.
                    </p>
                </header>

                <JournalComposer />

                <div className="border-t border-primary/10 pt-12">
                    <JournalHistory userId={user.id} />
                </div>
            </main>

            {/* Right: Life Snapshot Sidebar */}
            <aside className="space-y-8">
                <div className="sticky top-8 space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Activity className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Life Snapshot</h2>
                    </div>

                    {snapshot ? (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-1000">
                            {/* Psychological Profile */}
                            <Card className="bg-primary/5 border-none shadow-none">
                                <CardContent className="p-5 space-y-2">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Psychological Profile</p>
                                    <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                        &quot;{snapshot.psychologicalProfile || 'Building patterns...'}&quot;
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Active Goals */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-1 text-primary/70">
                                    <Target className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Objectives</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {snapshot.objectives?.slice(0, 3).map((obj: string, i: number) => (
                                        <div key={i} className="text-xs py-2 px-3 bg-accent/30 rounded-lg text-foreground/70 font-medium">
                                            {obj}
                                        </div>
                                    )) || <p className="text-xs italic text-muted-foreground">Analyzing objectives...</p>}
                                </div>
                            </div>

                            {/* Social Circle */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 px-1 text-primary/70">
                                    <Users className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Social Circle</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {snapshot.socialCircle?.slice(0, 5).map((person: { name: string }, i: number) => (
                                        <div key={i} className="text-[10px] py-1 px-2 border border-primary/10 rounded-full text-foreground/60 font-medium">
                                            {person.name}
                                        </div>
                                    )) || <p className="text-xs italic text-muted-foreground">Mapping social circle...</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-primary/5 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary/20" />
                            <p className="text-xs text-muted-foreground">Your first entry will generate your life snapshot.</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
