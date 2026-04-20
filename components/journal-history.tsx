import { JournalHistoryList } from './journal-history-list';
import { getJournalHistory } from '@/app/actions/journal';

interface JournalHistoryProps {
    userId: string;
}

export async function JournalHistory({ userId }: JournalHistoryProps) {
    // Initial fetch of 10 entries
    const history = await getJournalHistory(0, 10);

    return <JournalHistoryList initialHistory={history} userId={userId} />;
}
