'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
    const { language, setLanguage, isPending } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-2 overflow-hidden transition-all duration-300 relative group"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            disabled={isPending}
        >
            <Globe className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-12" />
            <div className="relative h-4 w-12 flex items-center justify-center font-medium">
                <span
                    className={cn(
                        "absolute transition-all duration-300",
                        language === 'es' ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                    )}
                >
                    ES
                </span>
                <span
                    className={cn(
                        "absolute transition-all duration-300",
                        language === 'en' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    EN
                </span>
            </div>
        </Button>
    );
}
