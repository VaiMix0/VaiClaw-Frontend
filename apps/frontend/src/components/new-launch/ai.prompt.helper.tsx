import React, { FC, useState, useRef, useEffect } from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/form/button';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';
import { Editor } from '@tiptap/react';
import useSWR from 'swr';
import { api } from '@gitroom/frontend/lib/vaiclaw-api';

export const AIPromptHelper: FC<{ editor: Editor }> = ({ editor }) => {
    const t = useT();
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data } = useSWR('/v1/niches', async () => {
        try {
            const res = await api.listNiches();
            return res?.data || [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);

        // Simulate AI generation delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 3-Tier Fallback: API -> LocalStorage -> Default
        let industry = 'tech';
        let voice = 'professional';

        const activeNiche = data?.find((n: any) => n.enabled);
        if (activeNiche) {
            industry = activeNiche.niche;
            voice = activeNiche.brand_voice?.tone || 'professional';
        } else {
            industry = localStorage.getItem('onboarding_industry') || 'tech';
            voice = localStorage.getItem('onboarding_voice') || 'professional';
        }

        // In a real scenario, this would call your backend agent.graph.service.ts
        // For now, we simulate a response based on the prompt
        const generatedText = `Here is a drafted post for ${industry} in a ${voice} tone about: ${prompt}.\n\n🚀 #socialmedia #marketing #growth`;

        // Insert into TipTap Editor
        if (editor) {
            editor.commands.insertContent(generatedText);
        }

        setLoading(false);
        setIsOpen(false);
        setPrompt('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                data-tooltip-id="tooltip"
                data-tooltip-content={t('generate_with_ai', 'Generate with AI')}
                className="select-none cursor-pointer rounded-[6px] px-[8px] h-[30px] font-semibold text-[13px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white flex justify-center items-center gap-[4px] hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
                <span>✨</span>
                <span>{t('ai_generate', 'AI Generate')}</span>
            </div>

            {isOpen && (
                <div className="absolute z-[500] bottom-[40px] left-0 w-[400px] bg-[#1a1b23] border border-[#2b2d31] rounded-[12px] shadow-2xl p-[16px] flex flex-col gap-[12px]">
                    <div className="text-[14px] font-[600] text-white flex items-center gap-[6px]">
                        <span>✨</span> {t('write_with_ai', 'Write with AI')}
                    </div>
                    <p className="text-[12px] text-gray-400">
                        {t('ai_helper_desc', 'Enter a prompt and we will generate a post tailored to your brand voice and industry.')}
                    </p>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('ai_prompt_placeholder', 'E.g. Write a post announcing our new summer collection...')}
                        className="w-full bg-[#15161a] border border-[#2b2d31] rounded-[8px] p-[12px] text-[14px] text-white outline-none focus:border-[#622aff] resize-none h-[100px]"
                    />

                    <div className="flex justify-end gap-[8px] mt-[4px]">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-[16px] py-[8px] rounded-[8px] text-[13px] font-[500] text-gray-400 hover:text-white transition-colors"
                        >
                            {t('cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className={clsx(
                                "px-[16px] py-[8px] rounded-[8px] text-[13px] font-[600] text-white flex items-center justify-center min-w-[100px] transition-all",
                                loading || !prompt.trim()
                                    ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                    : "bg-gradient-to-r from-[#622aff] to-[#8b5cf6] hover:shadow-lg hover:shadow-purple-500/30"
                            )}
                        >
                            {loading ? (
                                <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t('generate', 'Generate')
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
