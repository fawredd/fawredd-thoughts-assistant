'use client';

import { useState } from 'react';
import { JournalEntryCard } from './journal-entry-card';
import { PsychologistInsight } from './psychologist-insight';
import { Button } from '@/components/ui/button';
import { getJournalHistory } from '@/app/actions/journal';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface Entry {
    id: string;
    content: string;
    createdAt: Date;
    aiResponse: string | null;
}

interface JournalHistoryListProps {
    initialHistory: Entry[];
    userId: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
});

export function JournalHistoryList({ initialHistory }: JournalHistoryListProps) {
    const [history, setHistory] = useState<Entry[]>(initialHistory);
    const [offset, setOffset] = useState(initialHistory.length);
    const [hasMore, setHasMore] = useState(initialHistory.length >= 10);
    const [isLoading, setIsLoading] = useState(false);
    const { language } = useLanguage();
    const trans = t[language];

    async function handleLoadMore() {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const nextBatch = await getJournalHistory(offset, 10);
            if (nextBatch.length < 10) {
                setHasMore(false);
            }
            setHistory((prev) => [...prev, ...nextBatch]);
            setOffset((prev) => prev + nextBatch.length);
        } catch (error) {
            console.error('Failed to load more entries:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (history.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 py-12">
                <p>{trans.feed_empty}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-md md:text-2x1 font-bold px-1 text-foreground/80">{trans.history_previous_entries}</h2>
            <div className="flex flex-col gap-8">
                {history.map((entry) => (
                    <div key={entry.id} className="space-y-3">
                        <JournalEntryCard
                            id={entry.id}
                            content={entry.content}
                            date={dateFormatter.format(new Date(entry.createdAt))}
                        />

                        {entry.aiResponse && (
                            <PsychologistInsight text={entry.aiResponse} />
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="rounded-full px-8 shadow-sm transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {trans.history_loading}
                            </>
                        ) : (
                            trans.history_load_more
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
