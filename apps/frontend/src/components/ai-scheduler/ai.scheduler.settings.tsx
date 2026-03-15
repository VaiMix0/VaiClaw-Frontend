'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import clsx from 'clsx';
import { MultiMediaComponent } from '@gitroom/frontend/components/media/media.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const AiSchedulerSettings = ({ accountInfo }: { accountInfo: any }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [media, setMedia] = useState<{ path: string, id: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const toaster = useToaster();
    const t = useT();
    const chatRef = useRef<HTMLDivElement>(null);
    const fetch = useFetch();

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage, media: [...media] }]);
        setLoading(true);

        try {
            // 1. Phân tích Intent để lấy danh sách giờ & nền tảng
            const intentRes = await fetch('/v1/content/extract-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const intentData = await intentRes.json();
            const extracted = intentData?.data || {
                topic: userMessage,
                is_recurring: false,
                dates: [new Date(Date.now() + 86400000).toISOString()],
                cron_configs: [],
                platforms: ['Facebook', 'TikTok']
            };

            if (extracted.is_recurring) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `Tôi đã nhận lệnh kích hoạt Chiến Dịch Tự Động (Auto-Pilot) cho chủ đề "${extracted.topic}" vào các khung giờ: ${extracted.cron_configs.join(', ')}. Hệ thống sẽ tự động tạo bài viết, tìm kiếm hình ảnh và đăng bài mỗi ngày. Bạn có muốn bắt đầu chiến dịch này không?`,
                        campaign: {
                            topic: extracted.topic,
                            platforms: extracted.platforms,
                            cron_configs: extracted.cron_configs
                        }
                    },
                ]);
                return;
            }

            const variantCount = Math.max(1, extracted.dates?.length || 1);

            // 2. Gọi Spin Backend để sinh Content cho từng nền tảng, số lượng variant = số lượng mốc giờ
            const socialPromise = fetch('/v1/content/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_id: '00000000-0000-0000-0000-000000000000',
                    body: `Chủ đề: ${extracted.topic}`,
                    platform: 'Facebook, Zalo, Instagram (Văn bản thu hút, có emoji)',
                    variants: variantCount
                })
            });

            const videoPromise = fetch('/v1/content/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_id: '00000000-0000-0000-0000-000000000000',
                    body: `Chủ đề: ${extracted.topic}`,
                    platform: 'TikTok, YouTube Shorts (Mô tả video ngắn gọn, hashtags trending)',
                    variants: variantCount
                })
            });

            const [socialRes, videoRes] = await Promise.all([socialPromise, videoPromise]);
            const socialData = await socialRes.json();
            const videoData = await videoRes.json();

            // socialData.data.spun_content is separated by "\n\n---\n\n"
            const socialSplits = (socialData?.data?.spun_content || "").split('\n\n---\n\n');
            const videoSplits = (videoData?.data?.spun_content || "").split('\n\n---\n\n');

            // 3. Ghép các kết quả trả về với từng khung giờ tương ứng
            const schedules = extracted.dates.map((dateStr: string, index: number) => {
                const sText = socialSplits[index] || socialSplits[0] || "Lỗi tạo nội dung";
                const vText = videoSplits[index] || videoSplits[0] || "Lỗi tạo nội dung";
                return {
                    date: dateStr,
                    preview: {
                        'Mạng Xã Hội': sText,
                        'Nền tảng Video': vText,
                    }
                };
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Tôi đã lập lịch đăng bài cho chủ đề "${extracted.topic}" vào ${variantCount} khung giờ. Bạn có muốn duyệt và lưu lịch không?`,
                    schedules: schedules
                },
            ]);
        } catch (err) {
            toaster.show('Failed to reach AI component');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSchedule = async (schedules: any[]) => {
        try {
            setLoading(true);

            // Lặp qua tất cả lịch và đăng bài
            const promises = schedules.map((slot) => {
                return fetch('/posts', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'schedule',
                        date: slot.date,
                        posts: Object.keys(slot.preview).map((platform) => ({
                            integration: { id: platform },
                            value: [{ content: slot.preview[platform], delay: 0 }],
                            image: media.length > 0 ? media.map(m => ({ id: m.id, path: m.path })) : undefined,
                            settings: {}
                        }))
                    })
                });
            });

            await Promise.all(promises);

            toaster.show(`Đã lưu lịch đăng cho ${schedules.length} mốc thời gian!`);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `✅ Đã lên lịch thành công cho ${schedules.length} mốc thời gian! Bạn có thể xem lại tại mục Lịch (Calendar).` }
            ]);
        } catch (e) {
            toaster.show('Lỗi lưu lịch bài đăng');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCampaign = async (campaign: any) => {
        try {
            setLoading(true);
            const res = await fetch('/v1/content/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: campaign.topic,
                    platforms: campaign.platforms,
                    cron_configs: campaign.cron_configs
                })
            });

            if (res.ok) {
                toaster.show(`Đã kích hoạt chiến dịch tự động!`);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: `✅ Chiến dịch Auto-Pilot đã được kích hoạt thành công! Hệ thống sẽ bắt đầu sản xuất nội dung theo lịch trình.` }
                ]);
            } else {
                toaster.show('Lỗi kích hoạt chiến dịch');
            }
        } catch (e) {
            toaster.show('Lỗi kích hoạt chiến dịch');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl bg-newBgColor border border-[#2b2d31] rounded-lg shadow-xl flex flex-col flex-1 min-h-0 max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#2b2d31] bg-[#1a1c20]">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    ✨ AI Scheduling Assistant
                </h2>
                <p className="text-sm text-textColor mt-1">
                    Tell me what you want to post and when. I will optimize the content for each channel and schedule it for you.
                </p>
            </div>

            {/* Chat Messages */}
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#131517]"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-textColor opacity-50">
                        <div className="text-4xl mb-4">🤖</div>
                        <p>Try saying: "Lên lịch bài đăng về bộ sưu tập vòng tay mới cho tất cả các nền tảng vào 8h sáng mai"</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={clsx(
                            "flex flex-col w-full",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}
                    >
                        <div
                            className={clsx(
                                "max-w-[95%] sm:max-w-[80%] rounded-xl p-3 sm:p-4",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-[#2b2d31] text-white rounded-tl-none border border-[#3b3d41]"
                            )}
                        >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            {/* Render user's media snapshot if they attached anything in their prompt */}
                            {msg.role === 'user' && msg.media?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.media.map((m: any, i: number) => (
                                        m.path.includes('.mp4') ? (
                                            <video key={i} controls className="h-[100px] w-[100px] rounded-[8px] bg-black">
                                                <source src={m.path} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <img key={i} src={m.path} className="h-[100px] w-[100px] max-w-full rounded-[8px] border border-newBgColorInner" />
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Actionable Multi-Schedules Preview inside AI Response */}
                            {msg.schedules && (
                                <div className="mt-4 space-y-4">
                                    {msg.schedules.map((slot: any, sIdx: number) => (
                                        <div key={sIdx} className="bg-[#1a1c20] border border-[#3b3d41] rounded-lg p-3">
                                            <h4 className="text-sm sm:text-base font-bold mb-3 text-yellow-500 break-words">
                                                🗓 #{sIdx + 1}: {new Date(slot.date).toLocaleString()}
                                            </h4>
                                            <div className="space-y-3">
                                                {Object.keys(slot.preview).map((platform) => (
                                                    <div key={platform} className="bg-[#131517] p-2 rounded border border-[#2b2d31]">
                                                        <div className="text-xs text-textColor uppercase tracking-wider mb-1">{platform}</div>
                                                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">{slot.preview[platform]}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-4 pt-3 border-t border-[#3b3d41] flex flex-col sm:flex-row justify-end gap-2 bg-[#2b2d31] p-3 rounded-b-lg">
                                        <Button
                                            className="bg-transparent border border-[#3b3d41] hover:bg-[#3b3d41] text-white text-sm"
                                            onClick={() => {/* Edit flow here */ }}
                                            disabled={loading}
                                        >
                                            Edit Variants
                                        </Button>
                                        <Button
                                            className="bg-primary hover:opacity-90 text-white font-medium shadow-md text-sm"
                                            onClick={() => handleConfirmSchedule(msg.schedules)}
                                            loading={loading}
                                        >
                                            Chấp nhận & Lưu
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Actionable Campaign Preview inside AI Response */}
                            {msg.campaign && (
                                <div className="mt-4 space-y-4">
                                    <div className="bg-[#1a1c20] border border-blue-500 rounded-lg p-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                        <div className="flex items-start gap-2 mb-3">
                                            <span className="text-2xl shrink-0">🚀</span>
                                            <h4 className="text-base font-bold text-blue-400 break-words min-w-0">
                                                Auto-Pilot: {msg.campaign.topic}
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                                            <div>
                                                <span className="text-gray-500 block mb-1">Nền tảng</span>
                                                <div className="font-medium break-words">{msg.campaign.platforms.join(', ')}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block mb-1">Lịch đăng</span>
                                                <div className="font-medium text-yellow-500 break-words">{msg.campaign.cron_configs.join(', ')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#3b3d41] flex justify-end bg-[#2b2d31] p-3 rounded-b-lg">
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md w-full"
                                            onClick={() => handleConfirmCampaign(msg.campaign)}
                                            loading={loading}
                                        >
                                            Kích Hoạt Chiến Dịch
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && input === '' && (
                    <div className="flex items-start">
                        <div className="bg-[#2b2d31] rounded-xl p-4 rounded-tl-none border border-[#3b3d41]">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Attachments */}
            <div className="px-4 pt-4 bg-[#1a1c20]">
                <MultiMediaComponent
                    allData={[{ content: input }]}
                    text={input}
                    label={t('attachments', 'Attachments (includes AI Image & Canvas Design)')}
                    description=""
                    value={media}
                    dummy={false}
                    name="image"
                    onChange={(e: any) => setMedia(e.target.value || [])}
                    onOpen={() => { }}
                    onClose={() => { }}
                />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1a1c20] flex gap-3 items-center">
                <input
                    name="ai-prompt"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="flex-1 bg-[#2b2d31] border-none !mt-0 h-[50px] rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="E.g. Lên lịch bài đăng về bộ sưu tập vòng tay mới"
                />
                <Button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="h-[50px] px-6 text-white rounded-lg shadow-md"
                >
                    Send
                </Button>
            </div>
        </div>
    );
};

