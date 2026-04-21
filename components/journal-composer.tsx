'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { submitJournalEntry } from '@/app/actions/journal';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

export function JournalComposer() {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const { language } = useLanguage();
    const trans = t[language];

    async function handleSubmit() {
        if (!input.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setAiResponse('');

        const toastId = toast.loading(trans.composer_toast_processing_title, {
            description: trans.composer_toast_processing_desc,
        });

        try {
            const stream = await submitJournalEntry(input);

            if (stream instanceof ReadableStream) {
                const reader = stream.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
                    setAiResponse((prev) => prev + chunk);
                }
            }

            setInput('');
            toast.success(trans.composer_toast_success_title, {
                id: toastId,
                description: trans.composer_toast_success_desc,
            });
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error(trans.composer_toast_error_title, {
                id: toastId,
                description: trans.composer_toast_error_desc,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="space-y-2">
            <Card className="shadow-sm border-primary/10 overflow-hidden py-1">
                <CardContent className="p-4 flex flex-col gap-3">
                    <Textarea
                        placeholder={trans.composer_placeholder}
                        className="min-h-[150px] border-none focus-visible:ring-0 resize-none p-0 text-md leading-relaxed"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !input.trim()}
                            className="rounded-full px-6 transition-all active:scale-95"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            {trans.composer_submit}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Response Section */}
            {(aiResponse || isSubmitting) && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 px-1">
                        <div className="relative">
                            <div className="h-3 w-3 rounded-full bg-primary animate-ping absolute opacity-75" />
                            <div className="h-3 w-3 rounded-full bg-primary relative" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide uppercase text-primary/80">
                            {trans.composer_psychologist_insight}
                        </span>
                    </div>
                    <Card className="bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border-primary/10 shadow-xl backdrop-blur-sm overflow-hidden relative group">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
                        <CardContent className="p-8">
                            <p className="text-lg leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap selection:bg-primary/20">
                                {aiResponse || (
                                    <span className="flex items-center gap-2 text-muted-foreground italic">
                                        {trans.composer_processing_thoughts}
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </span>
                                )}
                            </p>
                        </CardContent>
                        {aiResponse && !isSubmitting && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        )}
                    </Card>
                </section>
            )}
        </section>
    );
}
