'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

export function PsychologistInsight({ text }: { text: string }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);
    const { language } = useLanguage();
    const trans = t[language];

    useEffect(() => {
        const isSupported = 'speechSynthesis' in window;
        const timer = setTimeout(() => setSupported(isSupported), 0);
        return () => clearTimeout(timer);
    }, []);

    const toggleSpeech = () => {
        if (!supported) return;

        const synth = window.speechSynthesis;

        // 🛑 STOP si ya está hablando
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        const speakWithVoices = () => {
            const voices = synth.getVoices();

            // 🌎 1. Filtrar voces por idioma
            const langPrefix = language === 'es' ? 'es' : 'en';
            const languageVoices = voices.filter(v =>
                v.lang.toLowerCase().startsWith(langPrefix)
            );

            // 👩 2. Intentar elegir voz femenina / natural
            const preferredVoice =
                languageVoices.find(v =>
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('woman') ||
                    v.name.toLowerCase().includes('google') ||
                    v.name.toLowerCase().includes('microsoft')
                ) || languageVoices[0] || voices[0]; // fallback seguro

            const utterance = new SpeechSynthesisUtterance(text);

            // 🔴 MUY IMPORTANTE → fuerza pronunciación correcta
            utterance.lang = language === 'es' ? 'es-ES' : 'en-US';

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            setIsSpeaking(true);
            synth.speak(utterance);
        };

        // ⏳ 3. Chrome carga voces async (bug clásico)
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = speakWithVoices;
        } else {
            speakWithVoices();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    if (!text) return null;

    return (
        <div className="pl-6 border-l-2 border-primary/10 ml-6 space-y-2 group/insight transition-all">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-primary/60">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{trans.insight_title}</span>
                </div>
                {supported && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
                        onClick={toggleSpeech}
                        title={isSpeaking ? trans.insight_stop_reading : trans.insight_read_aloud}
                    >
                        {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                )}
            </div>
            <p className="text-sm italic text-muted-foreground leading-relaxed">
                &quot;{text}&quot;
            </p>
        </div>
    );
}
