import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsComponent } from '@gitroom/frontend/components/analytics/analytics.component';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

// Mock backend API call for `/analytics`
vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn((url: string, options: any) => {
        if (url.includes('/analytics/trending')) {
            return Promise.resolve({
                json: () => Promise.resolve({ last: '2023-01-01', predictions: '2023-01-02' }),
                ok: true,
                status: 200
            });
        }
        if (url.includes('/analytics')) {
            return Promise.resolve({
                json: () => Promise.resolve([
                    { login: 'test/test', stars: [{ totalStars: 10 }], forks: [{ totalForks: 5 }] }
                ]),
                ok: true,
                status: 200
            });
        }
        return Promise.resolve({
            json: () => Promise.resolve([]),
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
                    <AnalyticsComponent />
                </ContextWrapper>
            );
        });

        // Check if the overall Analytics component title renders
        expect(screen.getByText(/Analytics/i)).toBeTruthy();
    });
});
