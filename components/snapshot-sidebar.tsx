'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { type UserState } from '@/lib/ai/state-schema';
import { BookOpen, Target, Flame, Brain, Users, Activity, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

export function SnapshotSidebar({ state }: { state: UserState }) {
    const currentPhase = state.timelineContext?.currentPhase;
    const lastMilestone = state.timelineContext?.lastMilestone;
    const { language } = useLanguage();
    const trans = t[language];

    return (
        <div className="flex flex-col gap-6 p-4 w-full max-w-[400px]">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-primary">{trans.snapshot_title}</h2>
                <p className="text-sm text-muted-foreground">{trans.sidebar_journey_state}</p>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                <div className="space-y-6">

                    {/* Timeline Context */}
                    {(currentPhase || lastMilestone) && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-primary/80 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    {trans.sidebar_timeline}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {currentPhase && (
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{trans.sidebar_current_phase}</span>
                                        <p className="text-sm font-medium text-foreground">{currentPhase}</p>
                                    </div>
                                )}
                                {lastMilestone && (
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{trans.sidebar_last_milestone}</span>
                                        <p className="text-sm text-foreground/80">{lastMilestone}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Narrative Summary */}
                    {state.narrativeSummary && (
                        <Card className="border-none bg-accent/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {trans.sidebar_narrative_summary}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic leading-relaxed">{state.narrativeSummary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Psychological Profile */}
                    <Card className="border-none bg-accent/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Brain className="h-3.5 w-3.5" />
                                {trans.sidebar_psychological_profile}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic leading-relaxed">{state.psychologicalProfile}</p>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Current Problems */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-2">
                            <Flame className="h-3.5 w-3.5" />
                            {trans.sidebar_top_obstacles}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {state.problems.map((p, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1 font-normal bg-white/50">{p}</Badge>
                            ))}
                            {state.problems.length === 0 && <span className="text-xs text-muted-foreground italic px-2">{trans.sidebar_no_problems}</span>}
                        </div>
                    </section>

                    {/* Objectives */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-2">
                            <Target className="h-3.5 w-3.5" />
                            {trans.sidebar_active_goals}
                        </h3>
                        <ul className="space-y-2">
                            {state.objectives.map((o, i) => (
                                <li key={i} className="text-sm flex gap-2 items-start px-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{o}</span>
                                </li>
                            ))}
                            {state.objectives.length === 0 && <span className="text-xs text-muted-foreground italic px-2">{trans.sidebar_no_objectives}</span>}
                        </ul>
                    </section>

                    {/* Social Circle */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            {trans.sidebar_social_circle}
                        </h3>
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
                            {state.socialCircle.length === 0 && <span className="text-xs text-muted-foreground italic px-2">{trans.sidebar_no_social}</span>}
                        </div>
                    </section>

                    {/* Activities */}
                    <section className="space-y-3">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            {trans.sidebar_daily_patterns}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {state.activities.map((a, i) => (
                                <Badge key={i} variant="outline" className="rounded-full font-normal border-primary/20 bg-primary/5">{a}</Badge>
                            ))}
                            {state.activities.length === 0 && <span className="text-xs text-muted-foreground italic px-2">{trans.sidebar_no_activities}</span>}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
