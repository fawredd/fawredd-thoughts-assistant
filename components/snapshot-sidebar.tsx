'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type UserState } from '@/lib/ai/state-schema';

export function SnapshotSidebar({ state }: { state: UserState }) {
    return (
        <div className="flex flex-col gap-6 p-4 w-full max-w-[400px]">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-primary">Life Snapshot</h2>
                <p className="text-sm text-muted-foreground">Current state of your journey.</p>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                <div className="space-y-6">
                    {/* Psychological Profile */}
                    <Card className="border-none bg-accent/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Psychological Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic leading-relaxed">{state.psychologicalProfile}</p>
                        </CardContent>
                    </Card>

                    {/* Current Problems */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Top Obstacles</h3>
                        <div className="flex flex-wrap gap-2">
                            {state.problems.map((p, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1 font-normal bg-white/50">{p}</Badge>
                            ))}
                            {state.problems.length === 0 && <span className="text-xs text-muted-foreground italic px-2">No active problems identified.</span>}
                        </div>
                    </section>

                    {/* Objectives */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Active Goals</h3>
                        <ul className="space-y-2">
                            {state.objectives.map((o, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start px-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{o}</span>
                                </li>
                            ))}
                            {state.objectives.length === 0 && <span className="text-xs text-muted-foreground italic px-2">No active objectives listed.</span>}
                        </ul>
                    </section>

                    {/* Social Circle */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Social Circle</h3>
                        <div className="grid gap-3">
                            {state.socialCircle.map((s, i) => (
                                <Card key={i} className="bg-white/40 border-none">
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm">{s.name}</span>
                                            <Badge variant="outline" className="text-[10px] h-4 uppercase tracking-tighter">
                                                {s.sentiment}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-tight">{s.relation} — {s.context}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            {state.socialCircle.length === 0 && <span className="text-xs text-muted-foreground italic px-2">No social dynamics recorded.</span>}
                        </div>
                    </section>

                    {/* Activities */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Daily Patterns</h3>
                        <div className="flex flex-wrap gap-2">
                            {state.activities.map((a, i) => (
                                <Badge key={i} variant="outline" className="rounded-full font-normal border-primary/20 bg-primary/5">{a}</Badge>
                            ))}
                            {state.activities.length === 0 && <span className="text-xs text-muted-foreground italic px-2">No recurring activities found.</span>}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
