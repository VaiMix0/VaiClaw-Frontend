import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        alias: {
            '@gitroom/frontend': path.resolve(__dirname, './src'),
            '@gitroom/helpers': path.resolve(__dirname, '../../libraries/helpers/src'),
            '@gitroom/react': path.resolve(__dirname, '../../libraries/react-shared-libraries/src'),
            '@gitroom/nestjs-libraries': path.resolve(__dirname, '../../libraries/nestjs-libraries/src'),
        },
    },
})
