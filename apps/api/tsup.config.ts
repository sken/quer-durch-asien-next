import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['api/index.ts'],
    format: ['esm'],
    clean: true,
    target: 'esnext',
    tsconfig: 'tsconfig.json',
})