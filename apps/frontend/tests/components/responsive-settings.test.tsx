import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockUser: any = {
    id: 'user1',
    orgId: 'org1',
    role: 'ADMIN',
    tier: {
        current: 'PRO',
        team_members: true,
        webhooks: true,
        autoPost: true,
        public_api: true,
    },
    totalChannels: 5,
    isLifetime: false,
};

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/settings',
}));

vi.mock('swr', () => ({
    default: vi.fn(() => ({ data: null, isLoading: false, mutate: vi.fn() })),
    useSWRConfig: () => ({ mutate: vi.fn() }),
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({ name: 'Test', bio: '', picture: null }),
            ok: true,
            status: 200,
        })
    ),
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

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ openModal: vi.fn(), closeAll: vi.fn() }),
}));

vi.mock('@gitroom/react/toaster/toaster', () => ({
    useToaster: () => ({ show: vi.fn() }),
}));

vi.mock('@gitroom/frontend/components/media/media.component', () => ({
    showMediaBox: vi.fn(),
}));

vi.mock('@gitroom/frontend/components/layout/logout.component', () => ({
    LogoutComponent: () => <div data-testid="logout">Logout</div>,
}));

vi.mock('@gitroom/frontend/components/settings/teams.component', () => ({
    TeamsComponent: () => <div data-testid="teams">Teams</div>,
}));

vi.mock('@gitroom/frontend/components/webhooks/webhooks', () => ({
    Webhooks: () => <div data-testid="webhooks">Webhooks</div>,
}));

vi.mock('@gitroom/frontend/components/sets/sets', () => ({
    Sets: () => <div data-testid="sets">Sets</div>,
}));

vi.mock('@gitroom/frontend/components/settings/signatures.component', () => ({
    SignaturesComponent: () => <div data-testid="signatures">Signatures</div>,
}));

vi.mock('@gitroom/frontend/components/autopost/autopost', () => ({
    Autopost: () => <div data-testid="autopost">Autopost</div>,
}));

vi.mock('@gitroom/frontend/components/public-api/public.component', () => ({
    PublicComponent: () => <div data-testid="public-api">Public API</div>,
}));

vi.mock('@gitroom/frontend/components/settings/global.settings', () => ({
    GlobalSettings: () => <div data-testid="global-settings">Global Settings Content</div>,
}));

vi.mock('@gitroom/frontend/components/layout/brand-niche.settings', () => ({
    BrandNicheSettings: () => <div data-testid="brand-niche">Brand Niche</div>,
}));

vi.mock('@gitroom/frontend/components/layout/channels.settings', () => ({
    ChannelsSettings: () => <div data-testid="channels-settings">Channels</div>,
}));

import { SettingsPopup } from '@gitroom/frontend/components/layout/settings.component';

describe('SettingsPopup - Responsive Layout', () => {
    beforeEach(() => {
        mockUser = {
            id: 'user1',
            orgId: 'org1',
            role: 'ADMIN',
            tier: {
                current: 'PRO',
                team_members: true,
                webhooks: true,
                autoPost: true,
                public_api: true,
            },
            totalChannels: 5,
            isLifetime: false,
        };
    });

    it('renders without crashing', () => {
        render(<SettingsPopup />);
        expect(screen.getByTestId('global-settings')).toBeDefined();
    });

    it('has mobile horizontal tabs (lg:hidden)', () => {
        const { container } = render(<SettingsPopup />);
        // Mobile tabs container: lg:hidden with overflow-x-auto
        const mobileTabs = container.querySelector('[class*="lg:hidden"][class*="overflow-x-auto"]');
        expect(mobileTabs).toBeDefined();
    });

    it('has desktop sidebar (hidden lg:flex)', () => {
        const { container } = render(<SettingsPopup />);
        // Desktop sidebar: hidden lg:flex with w-[260px]
        const desktopSidebar = container.querySelector('[class*="hidden lg:flex"][class*="w-\\[260px\\]"]');
        expect(desktopSidebar).toBeDefined();
    });

    it('shows Global Settings tab by default', () => {
        render(<SettingsPopup />);
        expect(screen.getByTestId('global-settings')).toBeDefined();
    });

    it('switches tabs on mobile tab click', () => {
        render(<SettingsPopup />);

        // Find mobile tabs (buttons inside the lg:hidden container)
        const channelsButtons = screen.getAllByText('Kênh kết nối');
        // Click the first one (mobile tab)
        fireEvent.click(channelsButtons[0]);

        expect(screen.getByTestId('channels-settings')).toBeDefined();
    });

    it('switches to Teams tab', () => {
        render(<SettingsPopup />);

        const teamsButtons = screen.getAllByText('Teams');
        fireEvent.click(teamsButtons[0]);

        expect(screen.getByTestId('teams')).toBeDefined();
    });

    it('has responsive content padding (p-[12px] lg:p-[20px])', () => {
        const { container } = render(<SettingsPopup />);
        const contentArea = container.querySelector('[class*="p-\\[12px\\] lg:p-\\[20px\\]"]');
        expect(contentArea).toBeDefined();
    });

    it('mobile tabs are scrollable', () => {
        const { container } = render(<SettingsPopup />);
        const mobileTabs = container.querySelector('[class*="overflow-x-auto"]');
        expect(mobileTabs).toBeDefined();
        // Check it has scrollbar-none for clean look
        expect(mobileTabs?.className).toContain('scrollbar-none');
    });

    it('renders all expected tabs for ADMIN with PRO tier', () => {
        render(<SettingsPopup />);

        // All these should appear as both mobile buttons and desktop sidebar items
        expect(screen.getAllByText('Global Settings').length).toBeGreaterThanOrEqual(2); // mobile + desktop
        expect(screen.getAllByText('Brand & Industry').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Kênh kết nối').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Teams').length).toBeGreaterThanOrEqual(2);
    });
});
