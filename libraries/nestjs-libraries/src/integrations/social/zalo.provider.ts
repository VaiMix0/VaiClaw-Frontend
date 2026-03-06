import {
    AuthTokenDetails,
    PostDetails,
    PostResponse,
    SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import striptags from 'striptags';

const ZALO_TOKEN_URL = 'https://oauth.zaloapp.com/v4/oa/access_token';
const ZALO_API_BASE = 'https://openapi.zalo.me/v3.0/oa';
const ZALO_API_V2 = 'https://openapi.zalo.me/v2.0/oa';

/**
 * Zalo OA Provider — "1-touch" model (giống So9.vn)
 *
 * Mỗi tenant dùng App ID + App Secret của chính họ.
 * Không cần env var. Tenant nhập trực tiếp vào UI.
 *
 * Cách lấy credentials:
 * 1. Tạo app tại developers.zalo.me
 * 2. Vào app → OAuth → lấy App ID và App Secret
 * 3. Generate Access Token + Refresh Token qua Zalo OAuth Tool
 *    hoặc Postman/curl, rồi paste vào đây
 */
export class ZaloProvider extends SocialAbstract implements SocialProvider {
    identifier = 'zalo';
    name = 'Zalo OA';
    isBetweenSteps = false;
    isWeb3 = false;
    scopes = [] as string[];
    editor = 'normal' as const;

    maxLength() {
        return 2000;
    }

    async customFields() {
        return [
            {
                key: 'appId',
                label: 'App ID (từ developers.zalo.me)',
                validation: `/^\\d+$/`,
                type: 'text' as const,
            },
            {
                key: 'appSecret',
                label: 'App Secret',
                validation: `/^.{10,}$/`,
                type: 'password' as const,
            },
            {
                key: 'accessToken',
                label: 'Access Token (lấy từ Zalo OAuth Tool)',
                validation: `/^.{20,}$/`,
                type: 'password' as const,
            },
            {
                key: 'refreshToken',
                label: 'Refresh Token',
                validation: `/^.{20,}$/`,
                type: 'password' as const,
            },
        ];
    }

    async generateAuthUrl() {
        const state = makeId(17);
        return {
            url: state, // customFields flow — không cần OAuth redirect
            codeVerifier: makeId(10),
            state,
        };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails | string> {
        try {
            const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
            const { appId, appSecret, accessToken, refreshToken } = body;

            if (!appId || !appSecret || !accessToken || !refreshToken) {
                return 'Vui lòng điền đầy đủ App ID, App Secret, Access Token và Refresh Token.';
            }

            // Xác minh access token bằng cách lấy thông tin OA
            const oaRes = await fetch(`${ZALO_API_V2}/getoa`, {
                headers: { access_token: accessToken },
            });
            const oaData = await oaRes.json();

            if (oaData.error !== 0) {
                return `Access Token không hợp lệ: ${oaData.message || oaData.error}. Vui lòng tạo lại token.`;
            }

            const oa = oaData.data;

            // Lưu credentials vào accessToken (dạng JSON)
            const storedToken = JSON.stringify({ appId, appSecret, accessToken, refreshToken });

            return {
                id: String(oa.oa_id),
                name: oa.name,
                accessToken: storedToken,
                refreshToken: refreshToken,
                expiresIn: 3600, // Zalo token hết hạn sau 1 giờ
                picture: oa.avatar || '',
                username: oa.oa_id,
            };
        } catch (e) {
            console.error('Zalo authenticate error:', e);
            return 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin đã nhập.';
        }
    }

    async refreshToken(refreshTokenStr: string): Promise<AuthTokenDetails> {
        // refreshToken field lưu raw refresh token (không phải JSON)
        // Nhưng accessToken lưu JSON chứa cả appId + appSecret → cần parse customInstanceDetails để lấy
        // → Trong trường hợp này, ta parse từ refreshToken (ta lưu JSON vào đây cũng được)
        let appId: string;
        let appSecret: string;
        let rawRefreshToken: string;

        try {
            const parsed = JSON.parse(refreshTokenStr);
            appId = parsed.appId;
            appSecret = parsed.appSecret;
            rawRefreshToken = parsed.refreshToken;
        } catch {
            throw new Error('Không thể giải mã refresh token. Vui lòng kết nối lại Zalo OA.');
        }

        const res = await fetch(ZALO_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                secret_key: appSecret,
            },
            body: new URLSearchParams({
                app_id: appId,
                refresh_token: rawRefreshToken,
                grant_type: 'refresh_token',
            }),
        });

        const data = await res.json();
        if (data.error) {
            throw new Error(`Zalo refresh token lỗi: ${data.message}`);
        }

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        // Lấy lại OA info
        const oaRes = await fetch(`${ZALO_API_V2}/getoa`, {
            headers: { access_token: newAccessToken },
        });
        const oaData = await oaRes.json();
        const oa = oaData.data || {};

        const storedToken = JSON.stringify({
            appId,
            appSecret,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
        const storedRefresh = JSON.stringify({ appId, appSecret, refreshToken: newRefreshToken });

        return {
            id: String(oa.oa_id || ''),
            name: oa.name || '',
            accessToken: storedToken,
            refreshToken: storedRefresh,
            expiresIn: 3600,
            picture: oa.avatar || '',
            username: String(oa.oa_id || ''),
        };
    }

    private parseToken(accessToken: string): {
        appId: string;
        appSecret: string;
        accessToken: string;
        refreshToken: string;
    } {
        return JSON.parse(accessToken);
    }

    /**
     * Upload ảnh lên Zalo, trả về attachment_id
     */
    private async uploadImage(token: string, imageUrl: string): Promise<string | null> {
        try {
            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) return null;

            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            const buffer = await imgRes.arrayBuffer();

            const form = new FormData();
            form.append('file', new Blob([buffer], { type: contentType }), 'image.jpg');

            const uploadRes = await fetch(`${ZALO_API_V2}/upload/image`, {
                method: 'POST',
                headers: { access_token: token },
                body: form,
            });

            const uploadData = await uploadRes.json();
            if (uploadData.error !== 0) {
                console.error('Zalo image upload error:', uploadData);
                return null;
            }

            return uploadData.data?.attachment_id || null;
        } catch (e) {
            console.error('Zalo uploadImage error:', e);
            return null;
        }
    }

    async post(
        id: string,
        accessTokenRaw: string,
        postDetails: PostDetails[],
        integration: Integration
    ): Promise<PostResponse[]> {
        const { accessToken } = this.parseToken(accessTokenRaw);
        const [firstPost] = postDetails;
        const text = striptags(firstPost.message || '');
        const media = firstPost.media || [];

        const messageBody: any = { text };

        if (media.length > 0) {
            const attachmentId = await this.uploadImage(accessToken, media[0].path);
            if (attachmentId) {
                messageBody.attachment = {
                    type: 'template',
                    payload: {
                        template_type: 'media',
                        elements: [{ media_type: 'image', attachment_id: attachmentId }],
                    },
                };
            }
        }

        const res = await fetch(`${ZALO_API_BASE}/message/broadcast`, {
            method: 'POST',
            headers: {
                access_token: accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { oa_id: id },
                message: messageBody,
            }),
        });

        const data = await res.json();
        if (data.error !== 0) {
            throw new Error(`Zalo post error: ${data.message} (${data.error})`);
        }

        const postId = data.data?.message_id || String(Date.now());
        return [
            {
                id: firstPost.id,
                postId,
                releaseURL: `https://zalo.me/oa`,
                status: 'completed',
            },
        ];
    }
}
