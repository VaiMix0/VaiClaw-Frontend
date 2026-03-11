// apps/frontend/src/lib/vaiclaw-api.ts

// Use NEXT_PUBLIC_BACKEND_URL (strips /api suffix), fallback to port 3001
const _backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001/api'
const API = _backendBase.replace(/\/api$/, '')

export class VaiClawAPI {
    /** Lấy JWT từ cookie auth= (giống custom.fetch.func.ts) */
    private getToken(): string {
        if (typeof document === 'undefined') return '';
        const match = document.cookie
            .split(';')
            .find((p) => p.trim().startsWith('auth='));
        return match ? match.trim().slice('auth='.length) : '';
    }

    /** @deprecated Không cần gọi thủ công nữa — token được đọc tự động từ cookie */
    setToken(_token: string) { }

    private async fetch(path: string, options: RequestInit = {}) {
        const token = this.getToken();
        const res = await fetch(`${API}${path}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
        })
        return res.json()
    }

    // Auth
    login(email: string, password: string) {
        return this.fetch('/api/v1/platform/login', {
            method: 'POST', body: JSON.stringify({ email, password })
        })
    }

    register(email: string, password: string, company_name: string) {
        return this.fetch('/api/v1/platform/register', {
            method: 'POST', body: JSON.stringify({ email, password, company_name })
        })
    }

    me() {
        return this.fetch('/api/v1/platform/me')
    }

    // Content
    generateContent(topic: string, platforms: string[]) {
        return this.fetch('/api/v1/content/generate', {
            method: 'POST', body: JSON.stringify({ topic, platforms })
        })
    }

    spinContent(contentId: string, body: string, platform: string, variants?: number, title?: string, hashtags?: string[], vary?: string[]) {
        return this.fetch('/api/v1/content/spin', {
            method: 'POST', body: JSON.stringify({ content_id: contentId, body, platform, variants, title, hashtags, vary })
        })
    }

    // Channels
    listAccounts() { return this.fetch('/api/v1/channels/accounts') }

    connectChannel(platform: string, redirectUri: string, credentials?: any) {
        return this.fetch('/api/v1/channels/connect', {
            method: 'POST',
            body: JSON.stringify({ platform, redirect_uri: redirectUri, credentials })
        })
    }

    publish(contentId: string, accountId: string, platform: string, body: string) {
        return this.fetch('/api/v1/channels/publish', {
            method: 'POST',
            body: JSON.stringify({ content_id: contentId, account_id: accountId, platform, body })
        })
    }

    // Niche Config (multi-niche)
    listNiches() {
        return this.fetch('/api/v1/niches')
    }
    getNiche(niche: string) {
        return this.fetch(`/api/v1/niches/${niche}`)
    }
    upsertNiche(niche: string, config: { enabled?: boolean; brand_voice?: any; platforms?: string[] }) {
        return this.fetch(`/api/v1/niches/${niche}`, {
            method: 'PUT', body: JSON.stringify(config)
        })
    }
    deleteNiche(niche: string) {
        return this.fetch(`/api/v1/niches/${niche}`, { method: 'DELETE' })
    }

    // Schedule
    getSchedule() { return this.fetch('/api/v1/channels/schedule') }
}

export const api = new VaiClawAPI()
