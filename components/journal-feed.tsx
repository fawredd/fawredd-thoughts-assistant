import { getOrCreateUser } from '@/lib/db-utils';
import { JournalHistory } from './journal-history';
import { JournalComposer } from './journal-composer';
import { db } from '@/db';
import { userStates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Sparkles, Activity, Users, Target } from 'lucide-react';
import { decryptJson } from '@/lib/encryption';
import { type UserState } from '@/lib/ai/state-schema';
import { t } from '@/lib/translations';

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
    const language = (user.language as 'es' | 'en') || 'es';
    const trans = t[language];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] h-full max-w-6xl mx-auto p-4 gap-12">
            {/* Left: Main Feed */}
            <main className="space-y-4">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Sparkles className="h-5 w-5" />
                        <span className="tracking-tight text-md uppercase">{trans.feed_mind_mirror}</span>
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
                        {trans.feed_description}
                    </p>
                </header>

                <JournalComposer />

                <div className="border-t border-primary/10 pt-6">
                    <JournalHistory userId={user.id} />
                </div>
            </main>

            {/* Right: Life Snapshot Sidebar */}
            <aside className="space-y-8">
                <div className="sticky top-8 space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Activity className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{trans.snapshot_title}</h2>
                    </div>

                    {snapshot ? (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-1000">
                            {/* Psychological Profile */}
                            <Card className="bg-primary/5 border-none shadow-none pb-2">
                                <CardTitle className="px-4"><p className="text-[10px] font-bold text-primary uppercase tracking-wider">{trans.sidebar_psychological_profile}</p></CardTitle>
                                <CardContent className="px-4">
                                    <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                        &quot;{snapshot.psychologicalProfile || trans.feed_building_patterns}&quot;
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Active Goals */}
                            <Card className="bg-primary/5 border-none shadow-none pb-2">
                                <CardTitle className="flex flex-row px-4 whitespace-nowrap">
                                    <Target className="h-4 w-4 mr-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{trans.sidebar_active_goals}</span>
                                </CardTitle>
                                <CardContent className="px-4">
                                    <div className="flex flex-col gap-2">
                                        {snapshot.objectives?.slice(0, 3).map((obj: string, i: number) => (
                                            <div key={i} className="text-xs py-2 px-3 bg-accent/30 rounded-lg text-foreground/70 font-medium">
                                                {obj}
                                            </div>
                                        )) || <p className="text-xs italic text-muted-foreground">{trans.feed_analyzing_objectives}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Circle */}
                            <Card className="bg-primary/5 border-none shadow-none pb-2">
                                <CardTitle className="flex flex-row px-4 whitespace-nowrap">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{trans.sidebar_social_circle}</span>
                                </CardTitle>
                                <CardContent className="px-4">
                                    <div className="flex flex-wrap gap-2">
                                        {snapshot.socialCircle?.slice(0, 5).map((person: { name: string }, i: number) => (
                                            <div key={i} className="text-[10px] py-1 px-2 border border-primary/10 rounded-full text-foreground/60 font-medium">
                                                {person.name}
                                            </div>
                                        )) || <p className="text-xs italic text-muted-foreground">{trans.feed_mapping_social}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-primary/5 rounded-2xl flex flex-col items-center text-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary/20" />
                            <p className="text-xs text-muted-foreground">{trans.feed_first_entry}</p>
                        </div>
                    )}
                    {/* DEV ONLY — remaining snapshot keys */}
                    {process.env.NODE_ENV === 'development' && snapshot && (() => {
                        const shownKeys = ['psychologicalProfile', 'objectives', 'socialCircle'];
                        const remaining = Object.entries(snapshot).filter(([key]) => !shownKeys.includes(key));
                        return (
                            <Card className="bg-yellow-500/10 border border-yellow-500/20 shadow-none">
                                <CardTitle className="px-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">DEV — Hidden Keys</span>
                                </CardTitle>
                                <CardContent className="px-4 flex flex-col gap-3">
                                    {remaining.map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600/70 mb-1">{key}</p>
                                            <pre className="text-[10px] text-foreground/60 whitespace-pre-wrap break-all bg-black/10 rounded p-2">
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })()}
                </div>
            </aside>
        </div>
    );
}
