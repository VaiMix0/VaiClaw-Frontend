import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Analytics } from '@gitroom/frontend/components/analytics/analytics';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

// Mock backend API call for `/analytics`
vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn((url, options) => {
        if (url.includes('/analytics/overview')) {
            return Promise.resolve({
                json: () => Promise.resolve({
                    ok: true,
                    data: {
                        content: { posts_today: 10, total_engagement: 50 },
                        ai: { calls_today: 5 },
                        channels: { platforms: [{ providerIdentifier: 'facebook', total: 10 }] }
                    }
                }),
                ok: true,
                status: 200
            });
        }
        return Promise.resolve({
            json: () => Promise.resolve({}),
            ok: true,
            status: 200
        });
    })
}));

describe('Analytics Dashboard Component', () => {
    it('renders the analytics headers and skeleton', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 1, tier: 'Pro' }}>
                    <Analytics />
                </ContextWrapper>
            );
        });

        // Check if the overall Analytics component title renders
        expect(screen.getByText(/Analytics/i)).toBeTruthy();
    });
});
