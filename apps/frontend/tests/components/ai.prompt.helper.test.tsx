import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIPromptHelper } from '@gitroom/frontend/components/new-launch/ai.prompt.helper';

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

describe('AIPromptHelper Component', () => {
    let mockEditor: any;

    beforeEach(() => {
        mockEditor = {
            commands: {
                insertContent: vi.fn()
            }
        };
        localStorage.clear();
    });

    it('renders the AI Generate button correctly', () => {
        render(<AIPromptHelper editor={mockEditor} />);

        const button = screen.getByText('AI Generate');
        expect(button).toBeTruthy();
    });

    it('toggles the prompt modal when clicked', () => {
        render(<AIPromptHelper editor={mockEditor} />);

        const generateBtn = screen.getByText('AI Generate');

        // Modal shouldn't be visible initially
        expect(screen.queryByText('Write with AI')).not.toBeTruthy();

        // Open
        fireEvent.click(generateBtn);
        expect(screen.getByText('Write with AI')).toBeTruthy();

        // Cancel
        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        // Should close
        expect(screen.queryByText('Write with AI')).not.toBeTruthy();
    });

    it('disables the generate button when prompt is empty', () => {
        render(<AIPromptHelper editor={mockEditor} />);

        // Open
        fireEvent.click(screen.getByText('AI Generate'));

        const generateBtn = screen.getByText('Generate');
        expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

        const textarea = screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...');

        // Type prompt
        fireEvent.change(textarea, { target: { value: 'This is a test prompt' } });

        // Button should be enabled
        expect((generateBtn as HTMLButtonElement).disabled).toBe(false);
    });

    it('generates content using localStorage traits and inserts it into the editor', async () => {
        // Mock traits previously saved from Onboarding
        localStorage.setItem('onboarding_industry', 'fitness');
        localStorage.setItem('onboarding_voice', 'energetic');

        render(<AIPromptHelper editor={mockEditor} />);

        // Open the helper
        fireEvent.click(screen.getByText('AI Generate'));

        // Type prompt
        const textarea = screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...');
        fireEvent.change(textarea, { target: { value: 'New gym equipment arrival' } });

        // Click Generate
        const generateBtn = screen.getByText('Generate');
        fireEvent.click(generateBtn);

        // Wait for generation to complete (simulated delay is 2s, but we can fast-forward timers in jest/vitest, though waiting with waitFor might suffice for this demonstration)
        // Note: The simulated delay in the actual component means this test might take time, so if needed, vi.useFakeTimers() is recommended.

        await waitFor(() => {
            expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
                expect.stringContaining('gym equipment arrival')
            );
            expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
                expect.stringContaining('fitness')
            );
            expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
                expect.stringContaining('energetic')
            );
        }, { timeout: 3000 });

        // Verify popup is closed
        expect(screen.queryByText('Write with AI')).not.toBeInTheDocument();
    });
});
