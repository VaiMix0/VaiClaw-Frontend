import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GeneratorPopup } from '@gitroom/frontend/components/launches/generator/generator';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

// Mock the LaunchStore to avoid Zustand context errors
vi.mock('@gitroom/frontend/components/new-launch/store', () => ({
    useLaunchStore: () => ({
        integrations: [],
        selectedIntegrations: [],
    })
}));

describe('Generator UI (Content Studio)', () => {
    it('displays VaiClaw AI Generator branding', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 0, tier: 'Free' }}>
                    <GeneratorPopup />
                </ContextWrapper>
            );
        });

        expect(screen.getByText(/VaiClaw AI Generator/i)).toBeTruthy();
    });

    it('contains essential fields for generating posts', () => {
        act(() => {
            render(
                <ContextWrapper user={{ id: '1', totalChannels: 0, tier: 'Free' }}>
                    <GeneratorPopup />
                </ContextWrapper>
            );
        });

        expect(screen.getByText(/Write anything/i)).toBeTruthy();
        expect(screen.getByText(/Output Format/i)).toBeTruthy();
    });
});
