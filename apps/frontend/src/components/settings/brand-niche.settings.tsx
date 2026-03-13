'use client';

import React, { FC, useState, useCallback, useEffect } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { api } from '@gitroom/frontend/lib/vaiclaw-api';
import clsx from 'clsx';
import { Input } from '@gitroom/react/form/input';
import { Select } from '@gitroom/react/form/select';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';

interface NicheConfig {
    tenant_id: string;
    niche: string;
    enabled: boolean;
    ai_model: string | null;
    system_prompt: string | null;
    brand_voice: any;
    platforms: string[];
    keywords: string[];
    geo_target: string | null;
    default_language: string;
}

export const BrandNicheSettings: FC = () => {
    const t = useT();
    const fetch = useFetch();
    const toast = useToaster();

    const { data, mutate, isLoading } = useSWR('/v1/niches', async () => {
        const res = await api.listNiches();
        return res?.data as NicheConfig[] || [];
    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingNiche, setEditingNiche] = useState<Partial<NicheConfig> | null>(null);
    const [isNew, setIsNew] = useState(false);

    const handleDelete = async (niche: string) => {
        if (confirm(t('confirm_delete_niche', 'Are you sure you want to delete this niche config?'))) {
            try {
                await api.deleteNiche(niche);
                toast.show(t('niche_deleted', 'Niche deleted successfully'));
                mutate();
            } catch (e) {
                toast.show(t('niche_delete_err', 'Failed to delete niche'));
            }
        }
    };

    const openAdd = () => {
        setIsNew(true);
        setEditingNiche({
            niche: '',
            enabled: true,
            brand_voice: { tone: 'professional', style: 'informative', emoji_level: 'Moderate', formality: 'Professional' },
            platforms: [],
            keywords: [],
            default_language: 'vi'
        });
        setEditModalOpen(true);
    };

    const openEdit = (config: NicheConfig) => {
        setIsNew(false);
        setEditingNiche({ ...config });
        setEditModalOpen(true);
    };

    const saveNiche = async () => {
        if (!editingNiche?.niche) return;
        try {
            await api.upsertNiche(editingNiche.niche, {
                enabled: editingNiche.enabled,
                brand_voice: editingNiche.brand_voice,
                platforms: editingNiche.platforms,
            });
            toast.show(t('niche_saved', 'Niche saved successfully'));
            setEditModalOpen(false);
            mutate();
        } catch (e) {
            toast.show(t('niche_save_err', 'Failed to save niche'));
        }
    };

    return (
        <div className="flex flex-col gap-[20px] w-full mt-[20px]">
            <div className="flex justify-between items-center mb-[20px]">
                <h2 className="text-[20px] font-semibold text-textColor">
                    {t('brand_niche_settings', 'Brand & Industry')}
                </h2>
                <Button onClick={openAdd}>
                    {t('add_niche', 'Add Niche')}
                </Button>
            </div>

            {isLoading ? (
                <div className="text-customColor18">Loading...</div>
            ) : data?.length === 0 ? (
                <div className="p-[40px] border border-dashed border-customColor6 rounded-[12px] text-center text-customColor18">
                    {t('no_niches', 'No brand/industry configured yet.')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    {data?.map(config => (
                        <div key={config.niche} className="p-[20px] bg-newBgColorInner border border-customColor6 rounded-[12px] flex flex-col gap-[12px]">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-[8px]">
                                    <h3 className="text-[18px] font-semibold text-white capitalize">{config.niche}</h3>
                                    <div className={clsx("px-[8px] py-[2px] rounded-[4px] text-[12px] font-bold", config.enabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                        {config.enabled ? 'Active' : 'Disabled'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-[8px]">
                                    <button onClick={() => openEdit(config)} className="text-customColor18 hover:text-white transition-colors">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(config.niche)} className="text-red-400 hover:text-red-300 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="text-[14px] text-customColor18 flex flex-col gap-[4px]">
                                <div><strong>Voice Tone:</strong> {config.brand_voice?.tone || 'N/A'}</div>
                                <div><strong>Language:</strong> {config.default_language}</div>
                                {config.platforms?.length > 0 && (
                                    <div><strong>Default Platforms:</strong> {config.platforms.join(', ')}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editModalOpen && editingNiche && (
                <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-[20px]" onClick={() => setEditModalOpen(false)}>
                    <div className="bg-[#1a1b23] w-full max-w-[500px] border border-[#2b2d31] rounded-[16px] p-[24px] flex flex-col gap-[20px]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-[20px] font-semibold text-white">
                            {isNew ? t('add_new_niche', 'Add New Niche') : t('edit_niche', 'Edit Niche')}
                        </h3>

                        <div className="flex flex-col gap-[16px]">
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[14px] font-[500] text-gray-300">Industry / Niche Key</label>
                                <input
                                    type="text"
                                    value={editingNiche.niche}
                                    readOnly={!isNew}
                                    onChange={e => setEditingNiche({ ...editingNiche, niche: e.target.value })}
                                    className={clsx("bg-[#15161a] border border-[#2b2d31] rounded-[8px] h-[40px] px-[16px] text-white outline-none focus:border-[#622aff]", !isNew && "opacity-60 cursor-not-allowed")}
                                    placeholder="e.g. fashion, food, saas"
                                />
                            </div>

                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[14px] font-[500] text-gray-300">Brand Voice Tone</label>
                                <select
                                    value={editingNiche.brand_voice?.tone || 'professional'}
                                    onChange={e => setEditingNiche({
                                        ...editingNiche,
                                        brand_voice: { ...editingNiche.brand_voice, tone: e.target.value }
                                    })}
                                    className="bg-[#15161a] border border-[#2b2d31] rounded-[8px] h-[40px] px-[16px] text-white outline-none focus:border-[#622aff]"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="humorous">Humorous</option>
                                    <option value="enthusiastic">Enthusiastic</option>
                                    <option value="empathetic">Empathetic</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-[8px] mt-[8px]">
                                <input
                                    type="checkbox"
                                    id="enabledCheck"
                                    checked={editingNiche.enabled}
                                    onChange={e => setEditingNiche({ ...editingNiche, enabled: e.target.checked })}
                                    className="w-[16px] h-[16px] accent-[#622aff] cursor-pointer"
                                />
                                <label htmlFor="enabledCheck" className="text-[14px] text-gray-300 cursor-pointer select-none">
                                    Enable Niche in Generation
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-[12px] mt-[16px]">
                            <Button onClick={() => setEditModalOpen(false)} className="bg-transparent border border-[#2b2d31] hover:bg-[#2b2d31]">
                                Cancel
                            </Button>
                            <Button onClick={saveNiche} disabled={!editingNiche.niche} className="bg-[#622aff] hover:bg-[#7c3aff]">
                                Save Niche
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

