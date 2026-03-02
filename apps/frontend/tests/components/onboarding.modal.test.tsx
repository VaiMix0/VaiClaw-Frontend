import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingModal } from '@gitroom/frontend/components/onboarding/onboarding.modal';

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ closeAll: vi.fn(), openModal: vi.fn() }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) }),
}));

vi.mock('swr', () => ({
    default: vi.fn().mockReturnValue({ data: [] }),
}));

vi.mock('@gitroom/frontend/components/launches/add.provider.component', () => ({
    AddProviderComponent: () => <div data-testid="add-provider">Add Provider Mock</div>,
}));

// Mock ResizeObserver for some potential internal library usage
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('OnboardingModal Flow', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders step 1 (Select Plan) correctly', () => {
        render(<OnboardingModal onClose={() => { }} />);

        // Welcome Header
        expect(screen.getByText('Choose your subscription tier')).toBeTruthy();

        // Should see Step indicators
        expect(screen.getByText('Select Plan')).toBeTruthy();
        expect(screen.getByText('Brand Setup')).toBeTruthy();
        expect(screen.getByText('Connect Channels')).toBeTruthy();
    });

    it('can navigate to step 2 (Brand Setup) and requires inputs before continuing', () => {
        render(<OnboardingModal onClose={() => { }} />);

        const startTrialBtn = screen.getByText('Start My Free Trial');

        act(() => {
            fireEvent.click(startTrialBtn);
        });

        // Should navigate to Step 2
        expect(screen.getByText('Configure Your Brand & Industry')).toBeTruthy();

        const continueBtn = screen.getByText('Continue');

        // Button should be disabled initially
        expect((continueBtn as HTMLButtonElement).disabled).toBe(true);

        // Select industry
        const industrySelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(industrySelect, { target: { value: 'tech' } });

        // Button still disabled
        expect((continueBtn as HTMLButtonElement).disabled).toBe(true);

        // Select brand voice
        const voiceSelect = screen.getAllByRole('combobox')[1];
        fireEvent.change(voiceSelect, { target: { value: 'professional' } });

        // Button should be enabled now
        expect((continueBtn as HTMLButtonElement).disabled).toBe(false);

        // Continue to step 3
        act(() => {
            fireEvent.click(continueBtn);
        });

        // Check local storage
        expect(localStorage.getItem('onboarding_industry')).toBe('tech');
        expect(localStorage.getItem('onboarding_voice')).toBe('professional');

        // Should navigate to Step 3
        expect(screen.getByText('Connect Your Channels')).toBeTruthy();
    });

    it('can skip step 3 (Connect Channels) and go to step 4 (Tutorial)', () => {
        render(<OnboardingModal onClose={() => { }} />);

        // Go to Step 2
        act(() => { fireEvent.click(screen.getByText('Start My Free Trial')); });

        // Complete Step 2
        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'tech' } });
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'professional' } });
        act(() => { fireEvent.click(screen.getByText('Continue')); });

        // Step 3
        expect(screen.getByText('Connect Your Channels')).toBeTruthy();

        // Click Skip for Now
        const skipBtn = screen.getByText('Skip for Now');
        act(() => { fireEvent.click(skipBtn); });

        // Should navigate to Step 4
        expect(screen.getByText('Learn How to Use Postiz')).toBeTruthy();

        // Finish Button
        const getStartedBtn = screen.getByText('Get Started');
        expect(getStartedBtn).toBeTruthy();
    });
});
