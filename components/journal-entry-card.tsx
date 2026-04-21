'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { updateJournalEntry, deleteJournalEntry } from '@/app/actions/journal';
import { useTransition } from 'react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface JournalEntryCardProps {
    id: string;
    content: string;
    date: string;
}

export function JournalEntryCard({ id, content, date }: JournalEntryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [isPending, startTransition] = useTransition();
    const { language } = useLanguage();
    const trans = t[language];

    async function handleUpdate() {
        if (!editedContent.trim() || editedContent === content) {
            setIsEditing(false);
            return;
        }

        startTransition(async () => {
            await updateJournalEntry(id, editedContent);
            setIsEditing(false);
        });
    }

    async function handleDelete() {
        if (!confirm(trans.entry_card_delete_confirm)) return;

        startTransition(async () => {
            await deleteJournalEntry(id);
        });
    }

    return (
        <Card className="border-none bg-accent/5 shadow-none group relative overflow-hidden transition-all hover:bg-accent/10">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {date}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:text-primary"
                                    onClick={() => setIsEditing(true)}
                                    disabled={isPending}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:text-destructive"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:bg-green-50"
                                    onClick={handleUpdate}
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedContent(content);
                                    }}
                                    disabled={isPending}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[100px] bg-background border-primary/20 focus-visible:ring-primary/30"
                        autoFocus
                    />
                ) : (
                    <p className="text-lg text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {content}
                    </p>
                )}
            </CardContent>

            {isPending && !isEditing && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
        </Card>
    );
}
