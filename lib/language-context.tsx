'use client';

import React, { createContext, useContext, useState, useTransition } from 'react';
import { updateUserLanguage } from '@/app/actions/user';

export type Language = 'es' | 'en';

export const LanguageContext = createContext<{
    language: Language;
    setLanguage: (lang: Language) => void;
    isPending: boolean;
}>({
    language: 'es',
    setLanguage: () => { },
    isPending: false,
});

export function LanguageProvider({
    children,
    initialLanguage
}: {
    children: React.ReactNode;
    initialLanguage: Language;
}) {
    const [language, setLanguageState] = useState<Language>(initialLanguage);
    const [isPending, startTransition] = useTransition();

    const setLanguage = (lang: Language) => {
        setLanguageState(lang); // Optimistic UI update
        startTransition(async () => {
            try {
                await updateUserLanguage(lang);
            } catch (error) {
                // Revert on error if necessary, or just log
                console.error('Failed to update language', error);
            }
        });
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, isPending }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
