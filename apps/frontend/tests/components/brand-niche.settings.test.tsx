import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandNicheSettings } from '@gitroom/frontend/components/settings/brand-niche.settings';

vi.mock('@gitroom/react/translation/get.transation.service.client', () => ({
    useT: () => (key: string, defaultString: string) => defaultString,
}));

vi.mock('@gitroom/react/toaster/toaster', () => ({
    useToaster: () => ({ show: vi.fn() }),
}));

vi.mock('@gitroom/react/form/button', () => ({
    Button: (props: any) => <button onClick={props.onClick} disabled={props.disabled}>{props.children}</button>,
}));

vi.mock('@gitroom/react/form/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@gitroom/react/form/select', () => ({
    Select: (props: any) => <select {...props}>{props.children}</select>,
}));

// useFetch mock
vi.mock('@gitroom/helpers/utils/custom.fetch', () => ({
    useFetch: () => vi.fn(),
}));

// Module-level SWR data, reassigned per test
let swrData: any[] = [];
let mutateMock = vi.fn();

vi.mock('swr', () => ({
    default: () => ({ data: swrData, mutate: mutateMock, isLoading: false }),
}));

// api mock — defined INSIDE factory so it doesn't get caught by hoisting
vi.mock('@gitroom/frontend/lib/vaiclaw-api', () => ({
    api: {
        listNiches: vi.fn().mockResolvedValue({ data: [] }),
        upsertNiche: vi.fn().mockResolvedValue({ ok: true }),
        deleteNiche: vi.fn().mockResolvedValue({ ok: true }),
    }
}));

import { api } from '@gitroom/frontend/lib/vaiclaw-api';

describe('BrandNicheSettings Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        swrData = [];
        mutateMock = vi.fn();
    });

    it('renders empty state message when no niches', () => {
        swrData = [];
        render(<BrandNicheSettings />);
        expect(screen.getByText('Brand & Industry')).toBeTruthy();
        expect(screen.getByText('No brand/industry configured yet.')).toBeTruthy();
        expect(screen.getByText('Add Niche')).toBeTruthy();
    });

    it('renders list of niches from API', () => {
        swrData = [
            { niche: 'fashion', enabled: true, brand_voice: { tone: 'casual' }, platforms: ['facebook'], default_language: 'vi' }
        ];
        render(<BrandNicheSettings />);
        expect(screen.getByText('fashion')).toBeTruthy();
        expect(screen.getByText('Active')).toBeTruthy();
        expect(screen.getByText(/casual/i)).toBeTruthy();
    });

    it('opens add niche modal when clicking Add Niche', () => {
        render(<BrandNicheSettings />);
        fireEvent.click(screen.getByText('Add Niche'));
        expect(screen.getByText('Add New Niche')).toBeTruthy();
        expect(screen.getByPlaceholderText('e.g. fashion, food, saas')).toBeTruthy();
    });

    it('saves new niche via api when clicking Save Niche', async () => {
        render(<BrandNicheSettings />);

        fireEvent.click(screen.getByText('Add Niche'));

        const input = screen.getByPlaceholderText('e.g. fashion, food, saas');
        fireEvent.change(input, { target: { value: 'tech' } });

        await act(async () => {
            fireEvent.click(screen.getByText('Save Niche'));
        });

        expect(vi.mocked(api.upsertNiche)).toHaveBeenCalledWith('tech', expect.objectContaining({
            enabled: true,
            brand_voice: expect.objectContaining({ tone: 'professional' }),
            platforms: []
        }));
    });

    it('deletes a niche via api when confirmed', async () => {
        swrData = [
            { niche: 'saas', enabled: true, brand_voice: {}, platforms: [], default_language: 'vi' }
        ];

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<BrandNicheSettings />);

        await act(async () => {
            fireEvent.click(screen.getByText('Delete'));
        });

        expect(confirmSpy).toHaveBeenCalled();
        expect(vi.mocked(api.deleteNiche)).toHaveBeenCalledWith('saas');

        confirmSpy.mockRestore();
    });

    it('does NOT delete if user cancels confirm dialog', async () => {
        swrData = [
            { niche: 'saas', enabled: true, brand_voice: {}, platforms: [], default_language: 'vi' }
        ];

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(<BrandNicheSettings />);

        await act(async () => {
            fireEvent.click(screen.getByText('Delete'));
        });

        expect(vi.mocked(api.deleteNiche)).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });
});
