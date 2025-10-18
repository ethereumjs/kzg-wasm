import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'
import type { Plugin } from 'vite'

// Plugin to stub Node.js modules in browser environment
const nodeModuleStubPlugin = (): Plugin => ({
  name: 'node-module-stub',
  resolveId(id) {
    if (id === 'path' || id === 'fs') {
      return id
    }
    return null
  },
  load(id) {
    if (id === 'path') {
      return 'export const resolve = () => ""; export default {};'
    }
    if (id === 'fs') {
      return 'export const readFileSync = () => new Uint8Array(); export default {};'
    }
    return null
  }
})

const config = defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'webdriverio',
      instances: [
        { browser: 'chrome' }
      ],
      headless: true,
    },
  },
  plugins: [
    wasm(),
    nodeModuleStubPlugin()
  ],
})

export default config