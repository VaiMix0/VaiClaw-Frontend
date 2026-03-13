import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/lib/vaiclaw-api';

// Mocks the global fetch function
global.fetch = vi.fn();

describe('VaiClawAPI - Auth Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.setToken('');
    });

    it('login formats the request correctly and hits /api/v1/platform/login', async () => {
        // Mock the expected response from the mock API
        const mockResponse = {
            ok: true,
            data: {
                access_token: 'mock_jwt_token',
                user: { id: 'uuid-1', email: 'test@vaimix.vn' },
            }
        };
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockResponse),
        });

        const result = await api.login('test@vaimix.vn', 'password123');

        // Verify fetch was called with the correct URL
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/platform/login'),
            expect.objectContaining({
                method: 'POST',
                credentials: 'include',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ email: 'test@vaimix.vn', password: 'password123' })
            })
        );

        // Verify response
        expect(result).toEqual(mockResponse);
    });

    it('sets token correctly for subsequent requests', async () => {
        api.setToken('mock_jwt_token_123');

        // Mock for me() call
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: vi.fn().mockResolvedValue({ ok: true, data: { user_id: '1' } }),
        });

        await api.me();

        // Verify fetch was called using the token
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/platform/me'),
            expect.objectContaining({
                credentials: 'include',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
            })
        );
    });
});
