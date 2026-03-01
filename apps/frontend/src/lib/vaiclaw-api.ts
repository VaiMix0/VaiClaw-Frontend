// apps/frontend/src/lib/vaiclaw-api.ts

const API = process.env.NEXT_PUBLIC_VAICLAW_API || 'http://localhost:8080'

export class VaiClawAPI {
    private token: string = ''

    setToken(token: string) { this.token = token }

    private async fetch(path: string, options: RequestInit = {}) {
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
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

    register(tenant_name: string, name: string, email: string, password_hash: string) {
        return this.fetch('/api/v1/platform/register', {
            method: 'POST', body: JSON.stringify({ tenant_name, name, email, password_hash })
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

    // Schedule
    getSchedule() { return this.fetch('/api/v1/channels/schedule') }
}

export const api = new VaiClawAPI()
