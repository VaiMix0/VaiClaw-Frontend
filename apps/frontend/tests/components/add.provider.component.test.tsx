import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddProviderComponent } from '@gitroom/frontend/components/launches/add.provider.component';

vi.mock('@gitroom/frontend/components/layout/new-modal', () => ({
    useModals: () => ({ closeAll: vi.fn(), openModal: vi.fn() }),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/react/helpers/variable.context', () => ({
    useVariables: () => ({ isGeneral: false, extensionId: 'mock-ext-id' }),
}));

vi.mock('@gitroom/react/toaster/toaster', () => ({
    useToaster: () => ({ show: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn(),
}));

// Mock DevicePairingModal to test toggle logic
vi.mock('@gitroom/frontend/components/devices/qr-connect.modal', () => ({
    DevicePairingModal: ({ onClose, onConnected }: any) => (
        <div data-testid="mock-pairing-modal">
            <button onClick={() => onConnected({ name: 'Galaxy S23' })}>Connect Device</button>
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

const mockSocial = [
    { identifier: 'facebook', name: 'Facebook Page', isExternal: false, isWeb3: false, isChromeExtension: false },
    { identifier: 'linkedin', name: 'LinkedIn', isExternal: false, isWeb3: false, isChromeExtension: false },
    { identifier: 'tiktok', name: 'TikTok Profile', isExternal: false, isWeb3: false, isChromeExtension: true },
    { identifier: 'zalo', name: 'Zalo Personal', isExternal: false, isWeb3: false, isChromeExtension: true }
];

describe('AddProviderComponent (Channel Settings)', () => {
    it('splits channels into Android Edge Devices and Cloud API', () => {
        act(() => {
            render(
                <AddProviderComponent
                    social={mockSocial}
                    article={[]}
                    invite={false}
                />
            );
        });

        // Verify the two main headers
        expect(screen.getByText('Thiết bị Android (Cá nhân)')).toBeTruthy();
        expect(screen.getByText('Cloud API (Official)')).toBeTruthy();

        // Unconnected device UI
        expect(screen.getByText('Chưa có thiết bị nào kết nối')).toBeTruthy();
    });

    it('displays social channels for Edge Device when device is connected', () => {
        act(() => {
            render(
                <AddProviderComponent
                    social={mockSocial}
                    article={[]}
                    invite={false}
                />
            );
        });

        // Click connect button
        const openModalBtn = screen.getByText('Kết Nối Thiết Bị');
        fireEvent.click(openModalBtn);

        // Verify modal opens
        expect(screen.getByTestId('mock-pairing-modal')).toBeTruthy();

        // Simulate connecting device
        fireEvent.click(screen.getByText('Connect Device'));

        // Device is now online, it should show TikTok and Zalo (isChromeExtension true)
        expect(screen.getByText('Online')).toBeTruthy();

        // Platforms should appear
        expect(screen.getByText('TikTok Profile')).toBeTruthy();
        expect(screen.getByText('Zalo Personal')).toBeTruthy();
    });

    it('displays social channels for Cloud API out of the box', () => {
        act(() => {
            render(
                <AddProviderComponent
                    social={mockSocial}
                    article={[]}
                    invite={false}
                />
            );
        });

        // Facebook Page and LinkedIn should be in the Cloud API list
        expect(screen.getByText('Facebook Page')).toBeTruthy();
        expect(screen.getByText('LinkedIn')).toBeTruthy();
    });
});
