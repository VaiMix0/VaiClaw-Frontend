import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GeneratorPopup } from '@gitroom/frontend/components/launches/generator/generator';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';

// Mock the LaunchStore to avoid Zustand context errors
vi.mock('@gitroom/frontend/components/new-launch/store', () => ({
    useLaunchStore: () => ({
        integrations: [] as any[],
        selectedIntegrations: [] as any[],
    })
}));

// Mock MUI composeClasses to avoid ESM import errors
vi.mock('@mui/utils/composeClasses', () => ({
    default: (slots: any, getUtilityClass: any, classes: any) => classes || {}
}));

// Mock deep components to avoid transitive dependency ESM errors
vi.mock('@gitroom/frontend/components/new-launch/add.edit.modal', () => ({
    AddEditModal: () => <div data-testid="add-edit-modal">Add Edit Modal</div>
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
        expect(screen.getAllByText(/Output Format/i).length).toBeGreaterThan(0);
    });
});
