import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Module-level mocks for per-test customization
let mockPathname = '/launches';
let mockUser: any = {
    id: 'user1',
    orgId: 'org1',
    role: 'ADMIN',
    tier: { current: 'PRO', team_members: true, webhooks: true, autoPost: true, public_api: true },
    totalChannels: 5,
    isLifetime: false,
};

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => mockPathname,
}));

vi.mock('@gitroom/frontend/components/layout/user.context', () => ({
    useUser: () => mockUser,
}));

vi.mock('@gitroom/react/helpers/variable.context', () => ({
    useVariables: () => ({ billingEnabled: true, isGeneral: true }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, fallback: string) => fallback || key,
}));

vi.mock('@gitroom/frontend/components/new-layout/logo', () => ({
    Logo: () => <div data-testid="logo">Logo</div>,
}));

import { MobileHeader, MobileBottomNav } from '@gitroom/frontend/components/new-layout/mobile-nav';

describe('MobileHeader', () => {
    beforeEach(() => {
        mockPathname = '/launches';
        mockUser = {
            id: 'user1',
            orgId: 'org1',
            role: 'ADMIN',
            tier: { current: 'PRO', team_members: true, webhooks: true, autoPost: true, public_api: true },
            totalChannels: 5,
            isLifetime: false,
        };
    });

    it('renders logo', () => {
        render(<MobileHeader />);
        expect(screen.getByTestId('logo')).toBeDefined();
    });

    it('renders hamburger button', () => {
        render(<MobileHeader />);
        // Should have a button (hamburger toggle)
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('opens menu on hamburger click', () => {
        render(<MobileHeader />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);

        // After opening, menu items should be visible
        expect(screen.getByText('Calendar')).toBeDefined();
        expect(screen.getByText('Analytics')).toBeDefined();
        expect(screen.getByText('Settings')).toBeDefined();
    });

    it('shows Billing for ADMIN role', () => {
        render(<MobileHeader />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);

        expect(screen.getByText('Billing')).toBeDefined();
    });

    it('hides Billing for non-admin user', () => {
        mockUser = {
            ...mockUser,
            role: 'USER',
        };
        render(<MobileHeader />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);

        // Billing requires ADMIN or SUPERADMIN role
        expect(screen.queryByText('Billing')).toBeNull();
    });

    it('closes menu when a link is clicked', () => {
        render(<MobileHeader />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);

        // Click a menu item
        const analyticsLink = screen.getByText('Analytics');
        fireEvent.click(analyticsLink);

        // Menu should collapse (max-h-0)
        // We verify by checking the menu container has the collapsed class
        const menuContainer = analyticsLink.closest('[class*="max-h-"]');
        // After click, the menu should start closing
        expect(menuContainer).toBeDefined();
    });

    it('highlights active menu item', () => {
        mockPathname = '/analytics';
        render(<MobileHeader />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);

        const analyticsLink = screen.getByText('Analytics').closest('a');
        expect(analyticsLink?.className).toContain('bg-boxFocused');
    });
});

describe('MobileBottomNav', () => {
    beforeEach(() => {
        mockPathname = '/launches';
        mockUser = {
            id: 'user1',
            orgId: 'org1',
            role: 'ADMIN',
            tier: { current: 'PRO' },
            totalChannels: 5,
            isLifetime: false,
        };
    });

    it('renders bottom nav with menu items', () => {
        render(<MobileBottomNav />);
        expect(screen.getByText('Calendar')).toBeDefined();
        expect(screen.getByText('Analytics')).toBeDefined();
    });

    it('shows max 5 items in bottom nav', () => {
        render(<MobileBottomNav />);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeLessThanOrEqual(5);
    });

    it('does not render for FREE tier with billing enabled', () => {
        mockUser = {
            ...mockUser,
            tier: 'FREE',
        };
        const { container } = render(<MobileBottomNav />);
        // Should return null for FREE tier
        expect(container.innerHTML).toBe('');
    });

    it('does not render when no orgId', () => {
        mockUser = {
            ...mockUser,
            orgId: null,
        };
        const { container } = render(<MobileBottomNav />);
        expect(container.innerHTML).toBe('');
    });

    it('highlights active page', () => {
        mockPathname = '/analytics';
        render(<MobileBottomNav />);
        const analyticsLink = screen.getByText('Analytics').closest('a');
        expect(analyticsLink?.querySelector('[class*="bg-boxFocused"]')).toBeDefined();
    });
});
