import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import useSWR from 'swr';

describe('TopMenu Component', () => {

    it('displays the Quota UI accurately for a Free user', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 2, postsCount: 5, tier: 'Free' }}>
                    <TopMenu />
                </ContextWrapper>
            );
        });

        // Check if the VaiClaw general Top Menu rendered
        expect(screen.getByText(/Post Quota/i)).toBeTruthy();
    });

    it('displays the Quota UI accurately for a Pro user', () => {
        // Override SWR to return Pro tier
        vi.mocked(useSWR).mockImplementation((key: any) => {
            if (key === '/billing/quota') return { data: { postsCount: 50, totalPosts: 1000, tier: 'Pro' }, isLoading: false, mutate: vi.fn() } as any;
            if (key === '/user/self') return { data: { id: 'mock-user', totalChannels: 0, tier: 'Pro' }, isLoading: false, mutate: vi.fn() } as any;
            return { data: null, isLoading: false, mutate: vi.fn() } as any;
        });

        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 2, postsCount: 50, tier: 'Pro' }}>
                    <TopMenu />
                </ContextWrapper>
            );
        });

        expect(screen.getByText(/You are on the Pro plan/i)).toBeTruthy();
    });
});
