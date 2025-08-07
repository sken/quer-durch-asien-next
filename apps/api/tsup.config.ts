import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['api/index.ts'],
    clean: true,
    target: 'esnext',
    tsconfig: 'tsconfig.json',
})