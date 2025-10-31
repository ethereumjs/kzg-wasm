import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'
import { webdriverio } from '@vitest/browser-webdriverio';

const config = defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: webdriverio(),
      instances: [
        { browser: 'chrome' }
      ],
      headless: true,
    },
  },
  plugins: [
    wasm(),
  ],
})

export default config