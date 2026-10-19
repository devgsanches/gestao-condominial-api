import { defineConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default defineConfig({
	...baseConfig,
	test: {
		...baseConfig.test,
		include: ['src/**/*.e2e-spec.ts'],
		setupFiles: ['./test/setup-e2e.ts'],
	},
})
