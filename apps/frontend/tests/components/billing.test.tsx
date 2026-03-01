import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BillingComponent } from '@gitroom/frontend/components/billing/billing.component';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

describe('Billing Component (Phase 4.9)', () => {
    it('renders the billing page structure', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 1, tier: 'Free' }}>
                    <BillingComponent />
                </ContextWrapper>
            );
        });

        expect(screen.getByText(/Billing/i)).toBeTruthy();
    });
});
