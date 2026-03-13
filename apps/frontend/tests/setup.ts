
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '',
}));

vi.mock('swr', () => ({
    default: vi.fn((key) => {
        if (key === '/user/self') return { data: { id: 'mock', totalChannels: 0, tier: 'Free' }, isLoading: false, mutate: vi.fn() };
        if (key === '/billing/quota') return { data: { postsCount: 5, totalPosts: 300, tier: 'Free' }, isLoading: false, mutate: vi.fn() };
        if (typeof key === 'string' && key.startsWith('/analytics')) return { data: [], isLoading: false, mutate: vi.fn() };
        return { data: null, error: undefined, isLoading: false, mutate: vi.fn() };
    }),
    useSWRConfig: () => ({ mutate: vi.fn() })
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn((url, options) => Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
        status: 200
    }))
}));

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ openModal: vi.fn(), closeAll: vi.fn(), closeCurrent: vi.fn() }),
}));

vi.mock('@gitroom/react/helpers/variable.context', () => ({
    useVariables: () => ({ billingEnabled: true, isGeneral: true }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, fallback: string) => fallback || key,
}));
