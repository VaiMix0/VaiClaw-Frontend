import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiConfirmationFlow } from '@gitroom/frontend/components/new-launch/ai.confirmation.flow';
import { api } from '@gitroom/frontend/lib/vaiclaw-api';

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/react/form/button', () => ({
    Button: (props: any) => <button onClick={props.onClick} className={props.className}>{props.children}</button>,
}));

vi.mock('@gitroom/frontend/lib/vaiclaw-api', () => ({
    api: {
        spinContent: vi.fn(),
    },
}));

describe('AiConfirmationFlow Component', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    const mockPosts = [
        {
            integration: { id: 'fb-123', identifier: 'facebook-page', name: 'My FB Page' },
            values: [{ content: 'This is the master content.' }]
        },
        {
            integration: { id: 'tk-456', identifier: 'tiktok-personal', name: 'My TikTok' },
            values: [{ content: 'This is the master content.' }]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the intro step correctly', () => {
        render(<AiConfirmationFlow posts={mockPosts} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        expect(screen.getByText(/Before we schedule your posts/i)).toBeTruthy();
        expect(screen.getByText('Skip & Schedule')).toBeTruthy();
        expect(screen.getByText('Yes, Spin Content ✨')).toBeTruthy();
    });

    it('calls onCancel when Skip & Schedule is clicked', () => {
        render(<AiConfirmationFlow posts={mockPosts} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByText('Skip & Schedule'));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls spinContent API and moves to review step when Spin is clicked', async () => {
        // Mock successful API response
        (api.spinContent as any).mockResolvedValueOnce({
            data: { spun_content: 'Facebook optimized content' }
        }).mockResolvedValueOnce({
            data: { spun_content: 'TikTok optimized content' }
        });

        render(<AiConfirmationFlow posts={mockPosts} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByText('Yes, Spin Content ✨'));

        // Should show spinning state
        expect(screen.getByText('AI is spinning your content for multiple platforms...')).toBeTruthy();

        // Wait for API calls to complete and review step to show
        await waitFor(() => {
            expect(screen.getByText('Review AI Generated Variants')).toBeTruthy();
        });

        expect(api.spinContent).toHaveBeenCalledTimes(2);

        // Check if platforms are rendered
        expect(screen.getByText('My FB Page')).toBeTruthy();
        expect(screen.getByText('My TikTok')).toBeTruthy();
    });

    it('calls onConfirm with selected spun contents when confirmed', async () => {
        // Mock successful API response
        (api.spinContent as any).mockResolvedValueOnce({
            data: { spun_content: 'Facebook Variant' }
        }).mockResolvedValueOnce({
            data: { spun_content: 'TikTok Variant' }
        });

        render(<AiConfirmationFlow posts={mockPosts} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByText('Yes, Spin Content ✨'));

        await waitFor(() => {
            expect(screen.getByText('Review AI Generated Variants')).toBeTruthy();
        });

        fireEvent.click(screen.getByText('Confirm & Schedule'));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).toHaveBeenCalledWith({
            'fb-123': 'Facebook Variant',
            'tk-456': 'TikTok Variant'
        });
    });
});
