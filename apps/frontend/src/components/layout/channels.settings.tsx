'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useSWR from 'swr';
import clsx from 'clsx';

export const ChannelsSettings: FC = () => {
    const fetch = useFetch();
    const toast = useToaster();
    const t = useT();

    // Load connected channels — force revalidate on mount/focus
    const loadChannels = useCallback(async () => {
        const res = await fetch('/integrations/list');
        const json = await res.json();
        return (json?.integrations || []) as any[];
    }, [fetch]);

    const { data, mutate, isLoading } = useSWR('integrations-list', loadChannels, {
        revalidateOnMount: true,
        revalidateOnFocus: true,
        revalidateIfStale: true,
    });

    const channels = data || [];
    const telegramChannels = channels.filter((c: any) => c.identifier === 'telegram');

    // Reconnect form state
    const [showForm, setShowForm] = useState(false);
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [connecting, setConnecting] = useState(false);

    const handleConnect = useCallback(async () => {
        if (!botToken || !chatId) return;
        setConnecting(true);
        try {
            const code = btoa(JSON.stringify({ botToken, chatId }));
            const res = await fetch('/integrations/social-connect/telegram', {
                method: 'POST',
                body: JSON.stringify({ code, state: 'settings' }),
            });
            if (res.ok) {
                toast.show(t('telegram_connected', 'Telegram kết nối thành công'));
                setBotToken('');
                setChatId('');
                setShowForm(false);
                mutate();
            } else {
                const err = await res.json();
                toast.show(err?.message || t('telegram_error', 'Kết nối thất bại'));
            }
        } catch {
            toast.show(t('telegram_error', 'Kết nối thất bại'));
        }
        setConnecting(false);
    }, [botToken, chatId]);

    const handleDisconnect = useCallback(async (channelId: string) => {
        await fetch(`/integrations/${channelId}`, { method: 'DELETE' });
        toast.show(t('telegram_disconnected', 'Đã ngắt kết nối Telegram'));
        mutate();
    }, []);

    return (
        <div className="flex flex-col gap-[20px]">
            <div className="flex items-center justify-between">
                <div className="text-[18px] font-[600]">{t('channels_title', 'Kênh kết nối')}</div>
                <button
                    onClick={() => mutate()}
                    className="text-[12px] text-customColor18 hover:text-textColor px-[10px] py-[5px] rounded-[6px] border border-newBorder hover:border-gray-500 transition-all"
                >
                    🔄 Làm mới
                </button>
            </div>
            <div className="text-[13px] text-customColor18">
                {t('channels_desc', 'Quản lý các kênh đã kết nối để đăng bài tự động.')}
            </div>

            {/* Connected Telegram channels */}
            {isLoading ? (
                <div className="text-customColor18 text-[14px]">Đang tải...</div>
            ) : telegramChannels.length === 0 ? (
                <div className="bg-newBgColorInner border border-newBorder rounded-[10px] p-[16px] text-customColor18 text-[14px]">
                    Chưa có kênh Telegram nào được kết nối.
                </div>
            ) : (
                <div className="flex flex-col gap-[10px]">
                    {telegramChannels.map((ch: any) => (
                        <div
                            key={ch.id}
                            className="bg-newBgColorInner border border-newBorder rounded-[10px] p-[16px] flex items-center justify-between"
                        >
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[20px]">✈️</span>
                                <div>
                                    <div className="font-[600] text-[15px]">{ch.name}</div>
                                    <div className="text-[12px] text-customColor18 mt-[2px]">
                                        {ch.chatUsername ? `@${ch.chatUsername}` : `ID: ${ch.chatId}`}
                                    </div>
                                    <div className="text-[11px] text-customColor18 mt-[1px]">
                                        Bot Token: <span className="font-mono">{ch.botToken}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-[8px]">
                                <span
                                    className={clsx(
                                        'text-[11px] px-[8px] py-[3px] rounded-full',
                                        ch.status === 'connected'
                                            ? 'bg-green-900/40 text-green-400'
                                            : 'bg-yellow-900/40 text-yellow-400'
                                    )}
                                >
                                    {ch.status === 'connected' ? '● Connected' : '● Disconnected'}
                                </span>
                                <button
                                    onClick={() => handleDisconnect(ch.id)}
                                    className="text-[12px] text-red-400 hover:text-red-300 px-[10px] py-[5px] rounded-[6px] border border-red-800 hover:border-red-600 transition-all"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Reconnect form */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-[8px] text-[14px] font-[500] px-[16px] py-[10px] rounded-[10px] border border-[#622aff] text-[#8b5cf6] hover:bg-[#622aff]/10 transition-all w-fit"
                >
                    <span>+</span>
                    {telegramChannels.length > 0
                        ? t('reconnect_telegram', 'Kết nối lại Telegram')
                        : t('connect_telegram', 'Kết nối Telegram')}
                </button>
            ) : (
                <div className="bg-newBgColorInner border border-newBorder rounded-[12px] p-[20px] flex flex-col gap-[14px]">
                    <div className="text-[15px] font-[600]">🤖 Kết nối Telegram Bot</div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[13px] text-customColor18">Bot Token</label>
                        <input
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            placeholder="123456:ABC-DEF..."
                            className="bg-[#0a0b0f] border border-newBorder rounded-[8px] h-[40px] px-[12px] text-[14px] outline-none focus:border-[#622aff] font-mono"
                        />
                        <div className="text-[11px] text-customColor18">
                            Tạo bot tại{' '}
                            <a href="https://t.me/BotFather" target="_blank" className="text-[#8b5cf6] hover:underline">
                                @BotFather
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[13px] text-customColor18">Chat ID / Username</label>
                        <input
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            placeholder="@channel_name hoặc -1001234567890"
                            className="bg-[#0a0b0f] border border-newBorder rounded-[8px] h-[40px] px-[12px] text-[14px] outline-none focus:border-[#622aff]"
                        />
                        <div className="text-[11px] text-customColor18">
                            Bot phải được add làm admin trong kênh/nhóm
                        </div>
                    </div>

                    <div className="flex gap-[10px]">
                        <button
                            onClick={handleConnect}
                            disabled={!botToken || !chatId || connecting}
                            className={clsx(
                                'px-[20px] py-[10px] rounded-[8px] text-[14px] font-[600] text-white transition-all',
                                botToken && chatId
                                    ? 'bg-gradient-to-r from-[#622aff] to-[#8b5cf6] hover:opacity-90 cursor-pointer'
                                    : 'bg-gray-600 opacity-50 cursor-not-allowed'
                            )}
                        >
                            {connecting ? 'Đang kết nối...' : 'Kết nối'}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-[20px] py-[10px] rounded-[8px] text-[14px] border border-newBorder hover:bg-boxHover transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

