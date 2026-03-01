import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vietnamese Localization (Phase 4.10)', () => {
    it('contains the complete vi translation mapping file', () => {
        const viLocalePath = path.resolve(__dirname, '../../../../libraries/react-shared-libraries/src/translation/locales/vi/translation.json');
        const fileContent = fs.readFileSync(viLocalePath, 'utf8');
        const viJSON = JSON.parse(fileContent);

        // Assert that the file isn't empty and contains key translations
        expect(Object.keys(viJSON).length).toBeGreaterThan(100);

        // Check specific specific keys for Vietnamese Phase 4 translation
        expect(viJSON['billing']).toBeDefined();
        expect(viJSON['analytics']).toBeDefined();
        expect(viJSON['dashboard']).not.toBeNull();
    });

    it('i18n.config.ts supports vi as an active language', () => {
        const configPath = path.resolve(__dirname, '../../../../libraries/react-shared-libraries/src/translation/i18n.config.ts');
        const configContent = fs.readFileSync(configPath, 'utf8');

        // Check if 'vi' is listed in the supported languages
        expect(configContent.includes("'vi'")).toBe(true);
    });
});
