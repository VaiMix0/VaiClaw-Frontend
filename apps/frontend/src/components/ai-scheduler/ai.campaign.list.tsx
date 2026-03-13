'use client';
import React, { useState, useEffect } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

export function AiCampaignList() {
    const fetch = useFetch();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await (await fetch('/v1/content/campaigns')).json();
            if (res.data) setCampaigns(res.data);
        } catch (e) {
            console.error('Failed to load campaigns', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            await fetch(`/v1/content/campaigns/${id}/toggle`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            loadCampaigns();
        } catch (e) { }
    };

    const deleteCampaign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await fetch(`/v1/content/campaigns/${id}`, { method: 'DELETE' });
            loadCampaigns();
        } catch (e) { }
    };

    if (loading) return <div>Loading campaigns...</div>;

    return (
        <div className="w-full flex flex-col gap-4">
            {campaigns.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">
                    Chưa có chiến dịch Auto-Pilot nào. Hãy tạo một chiến dịch mới ở trang AI Scheduler.
                </div>
            ) : (
                <div className="w-full border rounded-lg overflow-hidden border-gray-200 dark:border-[#27272a]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f4f4f5] dark:bg-[#27272a] text-[#71717a] dark:text-[#a1a1aa]">
                            <tr>
                                <th className="px-4 py-3 border-b border-gray-200 dark:border-[#3f3f46]">Campaign Info</th>
                                <th className="px-4 py-3 border-b border-gray-200 dark:border-[#3f3f46]">Schedule & Timing</th>
                                <th className="px-4 py-3 border-b border-gray-200 dark:border-[#3f3f46]">Performance</th>
                                <th className="px-4 py-3 border-b border-gray-200 dark:border-[#3f3f46]">Status</th>
                                <th className="px-4 py-3 border-b border-gray-200 dark:border-[#3f3f46] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c: any) => (
                                <tr key={c.id} className="border-b border-gray-200 dark:border-[#27272a] last:border-0 hover:bg-[#fafafa] dark:hover:bg-[#18181b]">
                                    {/* Campaign Info */}
                                    <td className="px-4 py-4 select-text max-w-[250px]">
                                        <div className="font-medium mb-2 text-base truncate" title={c.topic}>{c.topic}</div>
                                        <div className="flex gap-1 flex-wrap mb-2">
                                            {c.platforms.map((p: string) => (
                                                <span key={p} className="bg-gray-100 dark:bg-[#27272a] px-2 py-0.5 rounded text-xs border border-transparent dark:border-[#3f3f46]">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Media source: {c.media_source}</div>
                                    </td>

                                    {/* Schedule */}
                                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Cron:</span>
                                            <span className="font-mono text-[11px] bg-gray-100 dark:bg-[#27272a] px-1.5 py-0.5 rounded border border-gray-200 dark:border-[#3f3f46]">
                                                {c.cron_configs?.length ? c.cron_configs.join(' | ') : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Started:</span>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(c.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Next Post:</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400 text-xs">
                                                {c.next_post_date ? new Date(c.next_post_date).toLocaleString() : 'Scheduling...'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Performance */}
                                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Published:</span>
                                            <span className="font-semibold text-green-600 dark:text-green-500">{c.published_count || 0}</span>
                                        </div>
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Failed:</span>
                                            <span className="font-semibold text-red-600 dark:text-red-500">{c.failed_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 w-16 text-xs">Last Post:</span>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                                {c.last_published_date ? new Date(c.last_published_date).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${c.status === 'active' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'}`}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => alert('History Modal (WIP) - ID: ' + c.id)} className="text-xs mr-3 font-medium hover:underline text-gray-600 dark:text-gray-400">
                                            History
                                        </button>
                                        <button onClick={() => toggleStatus(c.id, c.status)} className="text-xs mr-3 font-medium hover:underline text-blue-600 dark:text-blue-400">
                                            {c.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                        <button onClick={() => deleteCampaign(c.id)} className="text-xs font-medium hover:underline text-red-600 dark:text-red-400">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

