'use client';

import React, { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useSWR from 'swr';
import clsx from 'clsx';

export const BrandNicheSettings: FC = () => {
    const fetch = useFetch();
    const toast = useToaster();
    const t = useT();
    const [saving, setSaving] = useState(false);

    // Load existing values
    const { data, mutate } = useSWR('/v1/niches', async () => {
        const res = await fetch('/v1/niches');
        return res.json();
    });

    const existing = data?.data?.[0];
    const [industry, setIndustry] = useState(existing?.id || localStorage.getItem('onboarding_industry') || '');
    const [brandVoice, setBrandVoice] = useState(existing?.brand_voice || localStorage.getItem('onboarding_voice') || '');

    const save = useCallback(async () => {
        if (!industry || !brandVoice) return;
        setSaving(true);
        try {
            await fetch(`/v1/niches/${industry}`, {
                method: 'PUT',
                body: JSON.stringify({
                    enabled: true,
                    brand_voice: { tone: brandVoice, style: 'informative', emoji_level: 'Moderate', formality: brandVoice },
                }),
            });
            localStorage.setItem('onboarding_industry', industry);
            localStorage.setItem('onboarding_voice', brandVoice);
            mutate();
            toast.show(t('brand_niche_saved', 'Brand & Industry settings saved'));
        } catch (e) {
            toast.show(t('brand_niche_error', 'Failed to save settings'));
        }
        setSaving(false);
    }, [industry, brandVoice]);

    return (
        <div className="flex flex-col gap-[20px]">
            <div className="text-[18px] font-[600]">{t('brand_niche_title', 'Brand & Industry')}</div>
            <div className="text-[13px] text-customColor18">
                {t('brand_niche_desc', 'Help AI understand your niche to generate tailored content.')}
            </div>

            <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[500]">{t('industry', 'Industry / Niche')}</label>
                <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-newBgColorInner border border-newBorder rounded-[8px] h-[44px] px-[12px] text-textColor outline-none focus:border-[#622aff] cursor-pointer"
                >
                    <option value="" disabled>{t('select_industry', 'Select an industry...')}</option>
                    <option value="fashion">👗 Fashion & Beauty</option>
                    <option value="food">🍔 Food & Beverage</option>
                    <option value="tech">💻 Technology & Gadgets</option>
                    <option value="education">📚 Education & Coaching</option>
                    <option value="entertainment">🎭 Entertainment & Gaming</option>
                    <option value="business">💼 B2B & Finance</option>
                    <option value="other">✨ Other</option>
                </select>
            </div>

            <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[500]">{t('brand_voice', 'Brand Voice')}</label>
                <select
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    className="bg-newBgColorInner border border-newBorder rounded-[8px] h-[44px] px-[12px] text-textColor outline-none focus:border-[#622aff] cursor-pointer"
                >
                    <option value="" disabled>{t('select_voice', 'Select a brand voice...')}</option>
                    <option value="professional">👔 Professional & Authoritative</option>
                    <option value="casual">👋 Casual & Friendly</option>
                    <option value="humorous">😂 Humorous & Witty</option>
                    <option value="enthusiastic">🎉 Enthusiastic & Energetic</option>
                    <option value="empathetic">❤️ Empathetic & Caring</option>
                </select>
            </div>

            <button
                onClick={save}
                disabled={!industry || !brandVoice || saving}
                className={clsx(
                    'mt-[8px] px-[24px] py-[12px] rounded-[10px] font-[600] text-[14px] text-white transition-all',
                    industry && brandVoice
                        ? 'bg-gradient-to-r from-[#622aff] to-[#8b5cf6] hover:from-[#7c3aff] hover:to-[#9d6eff] cursor-pointer'
                        : 'bg-gray-600 opacity-50 cursor-not-allowed'
                )}
            >
                {saving ? t('saving', 'Saving...') : t('save_settings', 'Save Settings')}
            </button>
        </div>
    );
};

