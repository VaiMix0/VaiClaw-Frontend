import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingModal } from '@gitroom/frontend/components/onboarding/onboarding.modal';

// ── The fetch mock factory: mockFetchImpl can be reassigned per-test ──────────
let mockFetchImpl = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: [] }),
});

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => mockFetchImpl,
}));

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ closeAll: vi.fn(), openModal: vi.fn() }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('swr', () => ({
    default: vi.fn().mockReturnValue({ data: [] }),
}));

vi.mock('@gitroom/frontend/components/launches/add.provider.component', () => ({
    AddProviderComponent: () => <div data-testid="add-provider">Add Provider Mock</div>,
}));

global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('OnboardingModal Flow', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset to default: empty niche list (→ no skip, renders step1)
        mockFetchImpl = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ data: [] }),
        });
    });

    // Helper: render and wait for loading state to finish
    async function renderModal() {
        let result: any;
        await act(async () => {
            result = render(<OnboardingModal onClose={() => { }} />);
        });
        return result;
    }

    it('renders step 1 (Select Plan) correctly', async () => {
        await renderModal();
        expect(screen.getByText('Choose your subscription tier')).toBeTruthy();
        expect(screen.getByText('Select Plan')).toBeTruthy();
        expect(screen.getByText('Brand Setup')).toBeTruthy();
        expect(screen.getByText('Connect Channels')).toBeTruthy();
    });

    it('can navigate to step 2 (Brand Setup) and requires inputs before continuing', async () => {
        await renderModal();

        act(() => { fireEvent.click(screen.getByText('Start My Free Trial')); });

        expect(screen.getByText('Configure Your Brand & Industry')).toBeTruthy();

        const continueBtn = screen.getByText('Continue');
        expect((continueBtn as HTMLButtonElement).disabled).toBe(true);

        const industrySelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(industrySelect, { target: { value: 'tech' } });
        expect((continueBtn as HTMLButtonElement).disabled).toBe(true);

        const voiceSelect = screen.getAllByRole('combobox')[1];
        fireEvent.change(voiceSelect, { target: { value: 'professional' } });
        expect((continueBtn as HTMLButtonElement).disabled).toBe(false);

        await act(async () => { fireEvent.click(continueBtn); });

        expect(localStorage.getItem('onboarding_industry')).toBe('tech');
        expect(localStorage.getItem('onboarding_voice')).toBe('professional');
        expect(screen.getByText('Connect Your Channels')).toBeTruthy();
    });

    it('can skip step 3 (Connect Channels) and go to step 4 (Tutorial)', async () => {
        await renderModal();

        act(() => { fireEvent.click(screen.getByText('Start My Free Trial')); });

        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'tech' } });
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'professional' } });
        await act(async () => { fireEvent.click(screen.getByText('Continue')); });

        expect(screen.getByText('Connect Your Channels')).toBeTruthy();

        const skipBtn = screen.getByText('Skip for Now');
        act(() => { fireEvent.click(skipBtn); });

        expect(screen.getByText('Learn How to Use Postiz')).toBeTruthy();
        expect(screen.getByText('Get Started')).toBeTruthy();
    });

    it('calls PUT /api/v1/niches/:niche when completing Step 2', async () => {
        // Override mockFetchImpl to capture calls
        mockFetchImpl = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ data: [], ok: true }),
        });

        await renderModal();
        act(() => { fireEvent.click(screen.getByText('Start My Free Trial')); });

        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'tech' } });
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'professional' } });
        await act(async () => { fireEvent.click(screen.getByText('Continue')); });

        // The mock should have been called with a PUT to niches
        expect(mockFetchImpl).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/niches/tech'),
            expect.objectContaining({ method: 'PUT' })
        );
    });

    it('skips Step 2 when DB already has niche configs', async () => {
        mockFetchImpl = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ data: [{ niche: 'fashion', enabled: true }] }),
        });

        await renderModal();

        // DB has data → step should jump to 3, never showing step 2
        expect(screen.queryByText('Configure Your Brand & Industry')).toBeNull();
        expect(screen.getByText('Connect Your Channels')).toBeTruthy();
    });

    it('shows Step 2 when DB has no niche configs', async () => {
        // default mockFetchImpl returns empty data → shows step 1
        await renderModal();

        act(() => { fireEvent.click(screen.getByText('Start My Free Trial')); });

        expect(screen.getByText('Configure Your Brand & Industry')).toBeTruthy();
    });
});
