import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIPromptHelper } from '@gitroom/frontend/components/new-launch/ai.prompt.helper';

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/react/form/button', () => ({
    Button: (props: any) => <button {...props}>{props.children}</button>,
}));

vi.mock('@gitroom/frontend/components/layout/loading', () => ({
    LoadingComponent: () => <div>Loading...</div>,
}));

// SWR module-level mock — swrData is reassigned per-test
let swrData: any = null;
vi.mock('swr', () => ({
    default: (_key: string) => ({ data: swrData }),
}));

// api mock
vi.mock('@gitroom/frontend/lib/vaiclaw-api', () => ({
    api: {
        listNiches: vi.fn().mockResolvedValue({ data: [] }),
    },
}));

describe('AIPromptHelper Component', () => {
    let mockEditor: any;

    beforeEach(() => {
        vi.useFakeTimers();
        mockEditor = { commands: { insertContent: vi.fn() } };
        localStorage.clear();
        swrData = null; // default: no API data
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the AI Generate button correctly', () => {
        render(<AIPromptHelper editor={mockEditor} />);
        expect(screen.getByText('AI Generate')).toBeTruthy();
    });

    it('toggles the prompt modal when clicked', () => {
        render(<AIPromptHelper editor={mockEditor} />);

        expect(screen.queryByText('Write with AI')).not.toBeTruthy();
        fireEvent.click(screen.getByText('AI Generate'));
        expect(screen.getByText('Write with AI')).toBeTruthy();

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByText('Write with AI')).not.toBeTruthy();
    });

    it('disables the generate button when prompt is empty', () => {
        render(<AIPromptHelper editor={mockEditor} />);
        fireEvent.click(screen.getByText('AI Generate'));

        const generateBtn = screen.getByText('Generate');
        expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

        fireEvent.change(
            screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...'),
            { target: { value: 'This is a test prompt' } }
        );
        expect((generateBtn as HTMLButtonElement).disabled).toBe(false);
    });

    it('generates content using localStorage traits (fallback) and inserts into editor', async () => {
        localStorage.setItem('onboarding_industry', 'fitness');
        localStorage.setItem('onboarding_voice', 'energetic');

        render(<AIPromptHelper editor={mockEditor} />);
        fireEvent.click(screen.getByText('AI Generate'));

        fireEvent.change(
            screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...'),
            { target: { value: 'New gym equipment arrival' } }
        );

        // Click generate, advance fake timer past 2s delay
        await act(async () => {
            fireEvent.click(screen.getByText('Generate'));
            vi.advanceTimersByTime(2500);
        });

        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('gym equipment arrival')
        );
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('fitness')
        );
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('energetic')
        );
    });

    it('uses API niche data when available (priority over localStorage)', async () => {
        swrData = [{ niche: 'technology', enabled: true, brand_voice: { tone: 'expert' } }];
        localStorage.setItem('onboarding_industry', 'fitness');
        localStorage.setItem('onboarding_voice', 'energetic');

        render(<AIPromptHelper editor={mockEditor} />);
        fireEvent.click(screen.getByText('AI Generate'));

        fireEvent.change(
            screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...'),
            { target: { value: 'Test prompt' } }
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Generate'));
            vi.advanceTimersByTime(2500);
        });

        // Should use 'technology' and 'expert' from API, not 'fitness'/'energetic'
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('technology')
        );
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('expert')
        );
    });

    it('falls back to localStorage when API returns no active niche', async () => {
        swrData = [{ niche: 'inactive-niche', enabled: false }];
        localStorage.setItem('onboarding_industry', 'fitness');
        localStorage.setItem('onboarding_voice', 'energetic');

        render(<AIPromptHelper editor={mockEditor} />);
        fireEvent.click(screen.getByText('AI Generate'));

        fireEvent.change(
            screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...'),
            { target: { value: 'Test prompt' } }
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Generate'));
            vi.advanceTimersByTime(2500);
        });

        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('fitness')
        );
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('energetic')
        );
    });

    it('uses default values when both API and localStorage are empty', async () => {
        swrData = null;
        localStorage.clear();

        render(<AIPromptHelper editor={mockEditor} />);
        fireEvent.click(screen.getByText('AI Generate'));

        fireEvent.change(
            screen.getByPlaceholderText('E.g. Write a post announcing our new summer collection...'),
            { target: { value: 'Test prompt' } }
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Generate'));
            vi.advanceTimersByTime(2500);
        });

        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('tech')
        );
        expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
            expect.stringContaining('professional')
        );
    });
});
