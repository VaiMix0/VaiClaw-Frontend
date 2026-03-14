import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/auth',
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}), ok: true, status: 200 })),
}));

vi.mock('@gitroom/react/helpers/variable.context', () => ({
    useVariables: () => ({
        billingEnabled: true,
        isGeneral: true,
        genericOauth: false,
        neynarClientId: '',
    }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, fallback: string) => fallback || key,
}));

vi.mock('@gitroom/helpers/utils/use.fire.events', () => ({
    useFireEvents: () => vi.fn(),
}));

vi.mock('@gitroom/react/helpers/use.track', () => ({
    useTrack: () => vi.fn(() => Promise.resolve()),
}));

vi.mock('react-use-cookie', () => ({
    default: () => ['', vi.fn()],
}));

vi.mock('@gitroom/frontend/components/auth/providers/google.provider', () => ({
    GoogleProvider: () => <div data-testid="google-provider">Google</div>,
}));

vi.mock('@gitroom/frontend/components/auth/providers/github.provider', () => ({
    GithubProvider: () => <div data-testid="github-provider">GitHub</div>,
}));

vi.mock('@gitroom/frontend/components/auth/providers/farcaster.provider', () => ({
    FarcasterProvider: () => null,
}));

vi.mock('@gitroom/frontend/components/auth/providers/wallet.provider', () => ({
    default: () => null,
}));

vi.mock('@gitroom/frontend/components/auth/providers/placeholder/wallet.ui.provider', () => ({
    WalletUiProvider: () => null,
}));

vi.mock('@gitroom/frontend/components/auth/providers/oauth.provider', () => ({
    OauthProvider: () => null,
}));

import { Login } from '@gitroom/frontend/components/auth/login';
import { RegisterAfter } from '@gitroom/frontend/components/auth/register';

describe('Login - Responsive', () => {
    it('renders sign in heading with responsive classes', () => {
        render(<Login />);
        const heading = screen.getByText('Sign In');
        expect(heading.tagName).toBe('H1');
        // Check responsive text size classes
        expect(heading.className).toContain('text-[28px]');
        expect(heading.className).toContain('sm:text-[40px]');
    });

    it('renders email and password inputs', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText('Email Address')).toBeDefined();
        expect(screen.getByPlaceholderText('Password')).toBeDefined();
    });

    it('renders sign in button', () => {
        render(<Login />);
        expect(screen.getByText('Sign in')).toBeDefined();
    });

    it('renders forgot password link', () => {
        render(<Login />);
        expect(screen.getByText('Forgot password')).toBeDefined();
    });

    it('renders sign up link', () => {
        render(<Login />);
        expect(screen.getByText('Sign Up')).toBeDefined();
    });

    it('renders Google provider', () => {
        render(<Login />);
        expect(screen.getByTestId('google-provider')).toBeDefined();
    });
});

describe('Register - Responsive', () => {
    it('renders sign up heading with responsive classes', () => {
        render(<RegisterAfter token="" provider="LOCAL" />);
        const heading = screen.getByText('Sign Up');
        expect(heading.tagName).toBe('H1');
        expect(heading.className).toContain('text-[28px]');
        expect(heading.className).toContain('sm:text-[40px]');
    });

    it('renders email, password, and company fields', () => {
        render(<RegisterAfter token="" provider="LOCAL" />);
        expect(screen.getByPlaceholderText('Email Address')).toBeDefined();
        expect(screen.getByPlaceholderText('Password')).toBeDefined();
        expect(screen.getByPlaceholderText('Company')).toBeDefined();
    });

    it('renders create account button', () => {
        render(<RegisterAfter token="" provider="LOCAL" />);
        expect(screen.getByText('Create Account')).toBeDefined();
    });

    it('renders terms and privacy links', () => {
        render(<RegisterAfter token="" provider="LOCAL" />);
        expect(screen.getByText('Terms of Service')).toBeDefined();
        expect(screen.getByText('Privacy Policy')).toBeDefined();
    });

    it('renders sign in link', () => {
        render(<RegisterAfter token="" provider="LOCAL" />);
        expect(screen.getByText('Sign In')).toBeDefined();
    });

    it('hides email/password when provider token exists', () => {
        render(<RegisterAfter token="some-token" provider="GOOGLE" />);
        // Email and password should not be present
        expect(screen.queryByPlaceholderText('Email Address')).toBeNull();
        expect(screen.queryByPlaceholderText('Password')).toBeNull();
        // But company should still be there
        expect(screen.getByPlaceholderText('Company')).toBeDefined();
    });
});
