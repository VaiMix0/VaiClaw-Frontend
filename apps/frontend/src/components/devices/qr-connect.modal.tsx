import React, { useState, useEffect } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

export const DevicePairingModal = ({
    onClose,
    onConnected,
}: {
    onClose: () => void;
    onConnected: (device: any) => void;
}) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const fetch = useFetch();

    const loadToken = async () => {
        try {
            const res = await fetch('/api/v1/devices/qr-token');
            const data = await res.json();
            setToken(data.token);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadToken();
    }, []);

    const handleCopy = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="glass-card-strong relative w-[450px] max-w-full overflow-hidden animate-fadeIn pb-6">
                <div className="mesh-dark absolute inset-0 -z-10" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-heading font-bold gradient-text">Kết Nối Ứng Dụng VaiClaw</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-xl leading-none">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center">
                    <p className="text-sm text-gray-300 text-center mb-6">
                        Mở ứng dụng <strong>VaiClaw</strong> trên điện thoại Android của bạn, vào phần <span>Kết nối hệ thống</span> và quét mã QR này hoặc nhập mã thủ công.
                    </p>

                    <div className="bg-white/10 p-4 rounded-2xl glow-border mb-6 flex justify-center items-center w-[232px] h-[232px]">
                        {loading ? (
                            <div className="text-primary-400 animate-pulse text-sm">
                                Đang tạo mã...
                            </div>
                        ) : token ? (
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token)}&color=085394&bgcolor=ffffff`}
                                alt="VaiClaw QR Code"
                                className="w-[200px] h-[200px] rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="text-red-400 text-sm">
                                Lỗi tạo mã
                            </div>
                        )}
                    </div>

                    <div className="w-full">
                        <p className="text-xs text-gray-400 mb-2 tracking-wide">Mã Token kết nối thủ công</p>
                        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl p-1">
                            <input
                                type="text"
                                readOnly
                                value={token || ''}
                                className="bg-transparent text-sm w-full outline-none text-white px-3 font-mono opacity-80"
                            />
                            <button
                                onClick={handleCopy}
                                disabled={!token}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${copied ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-primary-600 hover:bg-primary-500 text-white cursor-pointer'}`}
                            >
                                {copied ? 'Đã Copy!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Connection status listener placeholder */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-primary-300 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-primary-400" />
                        Đang chờ thiết bị kết nối...
                    </div>
                </div>
            </div>
        </div>
    );
};
