import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        alias: [
            { find: '@gitroom/frontend', replacement: path.resolve(__dirname, './src') },
            { find: '@gitroom/helpers', replacement: path.resolve(__dirname, '../../libraries/helpers/src') },
            { find: '@gitroom/react', replacement: path.resolve(__dirname, '../../libraries/react-shared-libraries/src') },
            { find: '@gitroom/nestjs-libraries', replacement: path.resolve(__dirname, '../../libraries/nestjs-libraries/src') },
            { find: '@mui/utils/composeClasses', replacement: path.resolve(__dirname, './tests/mock.utils.ts') }
        ],
    },
})
