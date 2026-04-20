'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function PsychologistInsight({ text }: { text: string }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        const isSupported = 'speechSynthesis' in window;
        const timer = setTimeout(() => setSupported(isSupported), 0);
        return () => clearTimeout(timer);
    }, []);

    const toggleSpeech = () => {
        if (!supported) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a nice female voice for a psychologist feel
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.name.includes('female') || v.name.includes('Google US English'));
            if (femaleVoice) utterance.voice = femaleVoice;

            utterance.rate = 0.9; // Slightly slower for better reflection
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
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
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Psychologist Insight</span>
                </div>
                {supported && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
                        onClick={toggleSpeech}
                        title={isSpeaking ? "Stop reading" : "Read aloud"}
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
