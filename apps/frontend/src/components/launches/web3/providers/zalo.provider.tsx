'use client';

import React, { FC } from 'react';
import { Web3ProviderInterface } from '@gitroom/frontend/components/launches/web3/web3.provider.interface';

/**
 * Zalo OA uses standard OAuth2 redirect — no custom connect UI needed.
 * The platform handles the redirect flow via generateAuthUrl → /integrations/social/zalo.
 */
export const ZaloProvider: FC<Web3ProviderInterface> = () => {
    return (
        <div className="flex flex-col items-center justify-center pt-4 gap-3 text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 60 60"
                width="48"
                height="48"
            >
                <circle cx="30" cy="30" r="30" fill="#0068FF" />
                <text
                    x="30"
                    y="38"
                    textAnchor="middle"
                    fill="white"
                    fontSize="22"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                >
                    Z
                </text>
            </svg>
            <p className="text-sm text-gray-400">
                Bạn sẽ được chuyển đến trang xác thực Zalo OA.
                <br />
                Hãy đăng nhập và cấp quyền cho ứng dụng.
            </p>
        </div>
    );
};

