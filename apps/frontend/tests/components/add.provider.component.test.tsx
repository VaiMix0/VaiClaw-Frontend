import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddProviderComponent } from '@gitroom/frontend/components/launches/add.provider.component';

const mockSocial = [
    { identifier: 'facebook', name: 'Facebook', isExternal: false, isWeb3: false, isChromeExtension: false },
    { identifier: 'linkedin', name: 'LinkedIn', isExternal: false, isWeb3: false, isChromeExtension: false },
    { identifier: 'tiktok', name: 'TikTok', isExternal: false, isWeb3: false, isChromeExtension: true },
    { identifier: 'zalo', name: 'Zalo', isExternal: false, isWeb3: false, isChromeExtension: true }
];

describe('AddProviderComponent (Channel Settings)', () => {
    it('splits channels into Official and Personal (Proxy)', () => {
        act(() => {
            render(
                <AddProviderComponent
                    social={mockSocial}
                    article={[]}
                    invite={false}
                />
            );
        });

        // Both categories must be rendered based on Phase 4.6 separation
        expect(screen.getByText(/Official Channels/i)).toBeTruthy();
        expect(screen.getByText(/Personal Channels \(Proxy\)/i)).toBeTruthy();

        // Check if platforms are plotted correctly inside them.
        // We can just verify names exist
        expect(screen.getByText('Facebook')).toBeTruthy();
        expect(screen.getByText('TikTok')).toBeTruthy();
        expect(screen.getByText('Zalo')).toBeTruthy();
    });
});
