import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const config = defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true,
    },
  },
  resolve: {
    alias: {
      events: "false"
    },
  },
  plugins: [
    nodePolyfills({
      include: ['util', 'fs', 'buffer'],
    }),
    wasm()
  ],
})

export default config