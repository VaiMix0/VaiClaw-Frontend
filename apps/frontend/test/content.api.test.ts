import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/lib/vaiclaw-api';

// Mocks the global fetch function
global.fetch = vi.fn();

describe('VaiClawAPI - Content Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.setToken('test_token');
    });

    it('generateContent hits /api/v1/content/generate with correct body', async () => {
        const mockResponse = {
            ok: true,
            data: {
                id: 'content-1',
                topic: 'AI Marketing',
                status: 'draft',
            }
        };
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockResponse),
        });

        const topic = 'AI Marketing';
        const platforms = ['FACEBOOK', 'TIKTOK'];
        const result = await api.generateContent(topic, platforms);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/content/generate'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test_token',
                }),
                body: JSON.stringify({ topic, platforms })
            })
        );

        expect(result).toEqual(mockResponse);
    });
});
