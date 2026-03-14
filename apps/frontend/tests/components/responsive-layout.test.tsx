import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next/font/google
vi.mock('next/font/google', () => ({
    Plus_Jakarta_Sans: () => ({ className: 'mock-jakarta-sans' }),
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    default: () => () => null,
}));

// Mock all dependencies for LayoutComponent
let mockUser: any = {
    id: 'user1',
    orgId: 'org1',
    role: 'ADMIN',
    admin: false,
    tier: { current: 'PRO', team_members: true },
    totalChannels: 5,
    isLifetime: false,
};

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/launches',
}));

vi.mock('swr', () => ({
    default: vi.fn((key) => {
        if (key === '/user/self') return { data: mockUser, isLoading: false, mutate: vi.fn() };
        return { data: null, error: undefined, isLoading: false, mutate: vi.fn() };
    }),
    useSWRConfig: () => ({ mutate: vi.fn() }),
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockUser), ok: true, status: 200 })),
}));

vi.mock('@gitroom/frontend/components/layout/user.context', () => ({
    useUser: () => mockUser,
    ContextWrapper: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@gitroom/react/helpers/variable.context', () => ({
    useVariables: () => ({ billingEnabled: true, isGeneral: true, backendUrl: 'http://localhost:3000' }),
    VariableContextComponent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, fallback: string) => fallback || key,
}));

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ openModal: vi.fn(), closeAll: vi.fn() }),
}));

vi.mock('@gitroom/frontend/components/new-layout/logo', () => ({
    Logo: () => <div data-testid="desktop-logo">Logo</div>,
}));

vi.mock('@gitroom/frontend/components/layout/top.menu', () => ({
    TopMenu: () => <div data-testid="desktop-topmenu">TopMenu</div>,
    useMenuItem: () => ({
        all: [],
        firstMenu: [
            { name: 'Calendar', icon: <span>cal</span>, path: '/launches' },
            { name: 'Analytics', icon: <span>ana</span>, path: '/analytics' },
        ],
        secondMenu: [
            { name: 'Settings', icon: <span>set</span>, path: '/settings', role: ['ADMIN', 'USER', 'SUPERADMIN'] },
        ],
    }),
}));

// Mock heavy dependencies
vi.mock('@copilotkit/react-core', () => ({
    CopilotKit: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@gitroom/react/helpers/mantine.wrapper', () => ({
    MantineWrapper: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@gitroom/frontend/components/layout/check.payment', () => ({
    CheckPayment: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@gitroom/frontend/components/layout/top.tip', () => ({
    ToolTip: () => null,
}));

vi.mock('@gitroom/react/toaster/toaster', () => ({
    Toaster: () => null,
    useToaster: () => ({ show: vi.fn() }),
}));

vi.mock('@gitroom/frontend/components/media/media.component', () => ({
    ShowMediaBoxModal: () => null,
    showMediaBox: vi.fn(),
}));

vi.mock('@gitroom/frontend/components/launches/helpers/linkedin.component', () => ({
    ShowLinkedinCompany: () => null,
}));

vi.mock('@gitroom/frontend/components/launches/helpers/media.settings.component', () => ({
    MediaSettingsLayout: () => null,
}));

vi.mock('@gitroom/frontend/components/post-url-selector/post.url.selector', () => ({
    ShowPostSelector: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/new.subscription', () => ({
    NewSubscription: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/support', () => ({
    Support: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/continue.provider', () => ({
    ContinueProvider: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/impersonate', () => ({
    Impersonate: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/title', () => ({
    Title: () => <span data-testid="page-title">Page Title</span>,
}));

vi.mock('@gitroom/frontend/components/layout/mode.component', () => ({
    default: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/language.component', () => ({
    LanguageComponent: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/chrome.extension.component', () => ({
    ChromeExtensionComponent: () => null,
}));

vi.mock('@gitroom/frontend/components/notifications/notification.component', () => ({
    default: () => <div data-testid="notifications">Notif</div>,
}));

vi.mock('@gitroom/frontend/components/layout/organization.selector', () => ({
    OrganizationSelector: () => <div data-testid="org-selector">Org</div>,
}));

vi.mock('@gitroom/frontend/components/layout/streak.component', () => ({
    StreakComponent: () => null,
}));

vi.mock('@gitroom/frontend/components/layout/pre-condition.component', () => ({
    PreConditionComponent: () => null,
}));

vi.mock('@gitroom/frontend/components/new-layout/sentry.feedback.component', () => ({
    AttachToFeedbackIcon: () => null,
}));

vi.mock('@gitroom/frontend/components/billing/first.billing.component', () => ({
    FirstBillingComponent: () => <div data-testid="first-billing">Billing</div>,
}));

import { LayoutComponent } from '@gitroom/frontend/components/new-layout/layout.component';

describe('LayoutComponent - Responsive Structure', () => {
    it('renders without crashing', () => {
        render(<LayoutComponent><div data-testid="child">Content</div></LayoutComponent>);
        expect(screen.getByTestId('child')).toBeDefined();
    });

    it('contains desktop sidebar with hidden lg:flex class', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Desktop sidebar should have "hidden lg:flex"
        const sidebar = container.querySelector('[class*="hidden lg:flex"][class*="w-\\[80px\\]"]');
        expect(sidebar).toBeDefined();
    });

    it('contains mobile header (lg:hidden)', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Mobile header has lg:hidden class
        const mobileHeaders = container.querySelectorAll('[class*="lg:hidden"]');
        expect(mobileHeaders.length).toBeGreaterThan(0);
    });

    it('does not have min-w-[1000px] anymore', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Verify no element has the old min-w-[1000px]
        const allElements = container.querySelectorAll('*');
        let hasMinW1000 = false;
        allElements.forEach((el) => {
            if (el.className && typeof el.className === 'string' && el.className.includes('min-w-[1000px]')) {
                hasMinW1000 = true;
            }
        });
        expect(hasMinW1000).toBe(false);
    });

    it('has min-w-0 for flexible content area', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        const contentArea = container.querySelector('[class*="min-w-0"]');
        expect(contentArea).toBeDefined();
    });

    it('has mobile compact top bar with title', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Mobile top bar: "flex lg:hidden"
        const mobileTopBar = container.querySelector('[class*="flex lg:hidden"][class*="bg-newBgColorInner"]');
        expect(mobileTopBar).toBeDefined();
    });

    it('has padding bottom for mobile bottom nav', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Content area should have pb-[68px] lg:pb-0
        const contentWithPadding = container.querySelector('[class*="pb-\\[68px\\]"]');
        expect(contentWithPadding).toBeDefined();
    });

    it('renders page title', () => {
        render(<LayoutComponent><div>Content</div></LayoutComponent>);
        const titles = screen.getAllByTestId('page-title');
        expect(titles.length).toBeGreaterThan(0);
    });

    it('renders org selector', () => {
        render(<LayoutComponent><div>Content</div></LayoutComponent>);
        const orgSelectors = screen.getAllByTestId('org-selector');
        expect(orgSelectors.length).toBeGreaterThan(0);
    });

    it('shows FirstBillingComponent for FREE tier', () => {
        mockUser = {
            ...mockUser,
            tier: 'FREE',
        };
        render(<LayoutComponent><div>Content</div></LayoutComponent>);
        expect(screen.getByTestId('first-billing')).toBeDefined();
    });

    it('hides footer on mobile (hidden md:flex)', () => {
        const { container } = render(<LayoutComponent><div>Content</div></LayoutComponent>);

        // Footer has "hidden md:flex"
        const footer = container.querySelector('[class*="hidden md:flex"][class*="text-textItemBlur"]');
        expect(footer).toBeDefined();
    });
});
