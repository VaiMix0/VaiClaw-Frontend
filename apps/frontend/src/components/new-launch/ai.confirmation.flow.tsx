import React, { FC, useState } from 'react';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { api } from '@gitroom/frontend/lib/vaiclaw-api';

export const AiConfirmationFlow: FC<{
    posts: any[];
    onConfirm: (spunContents: Record<string, string>) => void;
    onCancel: () => void;
}> = ({ posts, onConfirm, onCancel }) => {
    const t = useT();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'intro' | 'spinning' | 'review'>('intro');
    const [spunResults, setSpunResults] = useState<{ id: string, platform: string, variants: string[], selectedIndex: number }[]>([]);

    const handleSpin = async () => {
        setLoading(true);
        setStep('spinning');
        try {
            const results = [];
            for (const p of posts) {
                // p.values[0].content is the HTML content of the post
                const content = p.values?.[0]?.content || '';
                const platform = p.integration?.identifier?.split('-')[0] || 'facebook';

                // Assuming content_id is generated or passed, using dummy for now
                const res = await api.spinContent('00000000-0000-0000-0000-000000000000', content, platform, 2);

                let variants = [content];
                if (res && res.data && res.data.spun_content) {
                    // split dummy variants for now, or just use the whole text as variant 1
                    variants = [res.data.spun_content];
                }

                results.push({
                    platform: p.integration?.name || platform,
                    variants,
                    selectedIndex: 0,
                    id: p.integration?.id
                });
            }
            setSpunResults(results);
            setStep('review');
        } catch (e) {
            console.error('Spin Failed:', e);
            setStep('intro');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        // Map integration ID to the selected spun content
        const finalContents: Record<string, string> = {};
        for (const res of spunResults) {
            finalContents[res.id] = res.variants[res.selectedIndex];
        }
        onConfirm(finalContents);
    };

    if (step === 'intro') {
        return (
            <div className="flex flex-col gap-4 text-white p-4">
                <p className="text-[16px]">
                    {t('ai_confirm_intro', 'Before we schedule your posts, our AI Assistant can review and spin your Master Content into optimized variants for each selected platform. Would you like to proceed?')}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500">{t('skip_and_schedule', 'Skip & Schedule')}</Button>
                    <Button onClick={handleSpin} className="bg-[#622aff]">{t('spin_content', 'Yes, Spin Content ✨')}</Button>
                </div>
            </div>
        );
    }

    if (step === 'spinning') {
        return (
            <div className="flex justify-center items-center h-[200px] flex-col gap-4">
                <div className="animate-spin h-[40px] w-[40px] border-4 border-white border-t-transparent rounded-full" />
                <p className="text-white font-medium">{t('spinning_wait', 'AI is spinning your content for multiple platforms...')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 text-white p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-[18px] font-bold mb-2">{t('review_spun_content', 'Review AI Generated Variants')}</h3>
            {spunResults.map((r, i) => (
                <div key={i} className="bg-newBgColorInner p-4 rounded-lg flex flex-col gap-2 border border-[#2b2d31]">
                    <div className="font-semibold text-[#622aff]">{r.platform}</div>
                    <div className="flex gap-2">
                        {r.variants.map((v, vIndex) => (
                            <div
                                key={vIndex}
                                onClick={() => {
                                    const newRes = [...spunResults];
                                    newRes[i].selectedIndex = vIndex;
                                    setSpunResults(newRes);
                                }}
                                className={`flex-1 p-3 rounded-md cursor-pointer border transition-all text-[14px] ${r.selectedIndex === vIndex ? 'border-[#622aff] bg-[#622aff]/20' : 'border-[#2b2d31] hover:border-gray-500'}`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: v }} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex justify-end gap-2 mt-6">
                <Button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500">{t('cancel', 'Cancel')}</Button>
                <Button onClick={handleConfirm} className="bg-[#622aff]">{t('confirm_and_schedule', 'Confirm & Schedule')}</Button>
            </div>
        </div>
    );
};

