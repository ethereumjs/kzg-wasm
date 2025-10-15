import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  plugins: [
    wasm()
  ],
  test: {
    environment: 'node',
    hookTimeout: 120000,
  },
  resolve: {
    alias: {
      '../wasm/kzg.wasm': path.resolve(__dirname, 'wasm/kzg.wasm')
    }
  }
})

export default config
