import { getOrCreateUser } from '@/lib/db-utils';
import { JournalFeed } from '@/components/journal-feed';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { t } from '@/lib/translations';

export default async function IndexPage() {
  const { userId } = await auth();
  const user = await getOrCreateUser();
  const language = (user?.language as 'es' | 'en') || 'es';
  const trans = t[language];

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">Fawredd - <span className="text-muted-foreground font-small md:font-medium">Thoughts</span></h1>
          <p className="text-xl text-muted-foreground text-center max-w-[600px] leading-relaxed">
            {trans.landing_description}
          </p>
        </div>
        <div className="flex flex-col items-center gap-6 mt-8">
          <Link href="/sign-in" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95">
            {trans.landing_button}
          </Link>

          <div className="max-w-[500px] p-6 rounded-2xl bg-destructive/5 border border-destructive/10 text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/60">{trans.landing_warning_title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {trans.landing_warning}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Error initializing account. Please try again.</div>;
  }

  return <JournalFeed />;
}
