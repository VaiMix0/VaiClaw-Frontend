import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OnboardingModal } from '@gitroom/frontend/components/onboarding/onboarding.modal';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

describe('OnboardingModal Flow', () => {
    it('renders step 1 (Select Plan) correctly', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 0, tier: 'Free' }}>
                    <OnboardingModal onClose={() => { }} />
                </ContextWrapper>
            );
        });

        // Welcome Header
        expect(screen.getByText(/We are so happy to have you!/i)).toBeTruthy();

        // Should see Step 1 indicator
        expect(screen.getByText(/STEP 1/i)).toBeTruthy();
    });

    it('can navigate to step 2 (Connect Channels) after selecting Free Plan', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 0, tier: 'Free' }}>
                    <OnboardingModal onClose={() => { }} />
                </ContextWrapper>
            );
        });

        const freePlanButton = screen.getByText(/Free Forever/i);
        expect(freePlanButton).toBeTruthy();

        // Simulate clicking the Free Plan button
        act(() => {
            fireEvent.click(freePlanButton);
        });

        // Click Start Trial
        const startTrialBtn = screen.getByText(/Start My Free Trial/i);
        act(() => {
            fireEvent.click(startTrialBtn);
        });

        // Should navigate to Step 2
        expect(screen.getByText(/STEP 2/i)).toBeTruthy();
        expect(screen.getByText(/Connect Channels/i)).toBeTruthy();
    });

    it('can navigate to step 3 (Tutorial) after continuing from channels', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 0, tier: 'Free' }}>
                    <OnboardingModal onClose={() => { }} />
                </ContextWrapper>
            );
        });

        // Go to step 2
        const freePlanButton = screen.getByText(/Free Forever/i);
        act(() => { fireEvent.click(freePlanButton); });

        const startTrialBtn = screen.getByText(/Start My Free Trial/i);
        act(() => { fireEvent.click(startTrialBtn); });

        // Go to step 3
        const continueBtn = screen.getByText(/Continue without channels/i);
        act(() => { fireEvent.click(continueBtn); });

        // Should navigate to Step 3
        expect(screen.getByText(/STEP 3/i)).toBeTruthy();
        expect(screen.getByText(/Learn How to Use Postiz/i)).toBeTruthy();
    });
});
