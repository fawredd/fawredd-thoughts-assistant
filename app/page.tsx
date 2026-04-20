import { getOrCreateUser } from '@/lib/db-utils';
import { JournalFeed } from '@/components/journal-feed';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function IndexPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tighter text-primary">Fawredd Thoughts</h1>
          <p className="text-xl text-muted-foreground text-center max-w-[600px] leading-relaxed">
            Your AI-powered journaling companion for longitudinal memory and reflective coaching.
          </p>
        </div>
        <div className="flex flex-col items-center gap-6 mt-8">
          <Link href="/sign-in" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>

          <div className="max-w-[500px] p-6 rounded-2xl bg-destructive/5 border border-destructive/10 text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/60">Important Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your data is encrypted in our database using industry-standard practices. By using this application, you acknowledge and consent to your data being analyzed by AI models.
AI-generated insights may not always be accurate, and the developer cannot guarantee the reliability, availability, or security of the service. Use of this application is at your own risk.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const user = await getOrCreateUser();
  if (!user) {
    return <div>Error initializing account. Please try again.</div>;
  }

  return <JournalFeed />;
}
