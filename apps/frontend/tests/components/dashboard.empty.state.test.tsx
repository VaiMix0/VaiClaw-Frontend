import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardEmptyState } from '@gitroom/frontend/components/launches/dashboard.empty.state';
import { useRouter } from 'next/navigation';

// Mock the external dependencies
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/frontend/components/launches/add.provider.component', () => ({
    AddProviderButton: () => <button data-testid="add-provider-button">Connect Channels</button>,
}));

describe('DashboardEmptyState Component', () => {
    it('renders the welcome message correctly', () => {
        render(<DashboardEmptyState />);

        expect(screen.getByText('Welcome to VaiClaw! 🎉')).toBeTruthy();
        expect(screen.getByText('Your social media automation journey starts here. Explore our features and set up your workspace when you are ready.')).toBeTruthy();
    });

    it('renders all three step cards', () => {
        render(<DashboardEmptyState />);

        // Step 1
        expect(screen.getByText('1. Setup Your Brand')).toBeTruthy();
        expect(screen.getByText('Configure your industry and brand voice to help AI understand your niche.')).toBeTruthy();
        expect(screen.getByText('Configure Brand')).toBeTruthy();

        // Step 2
        expect(screen.getByText('2. Connect Channels')).toBeTruthy();
        expect(screen.getByText('Link your Facebook, Zalo, TikTok, and other social media accounts.')).toBeTruthy();
        expect(screen.getByTestId('add-provider-button')).toBeTruthy();

        // Step 3
        expect(screen.getByText('3. Create Magic with AI')).toBeTruthy();
        expect(screen.getByText('Once you have set up your brand and channels, use our AI Prompt to generate and schedule high-quality posts instantly.')).toBeTruthy();
    });

    it('navigates to the onboarding flow when Configure Brand is clicked', () => {
        const mockPush = vi.fn();
        (useRouter as any).mockReturnValue({ push: mockPush });

        render(<DashboardEmptyState />);

        const configBrandButton = screen.getByText('Configure Brand');
        fireEvent.click(configBrandButton);

        expect(mockPush).toHaveBeenCalledWith('/launches?onboarding=true&step=2');
    });
});
