import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'

const config = defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true,
    },
    alias: [
      { find: "events" , replacement: "false"} ,
      { find: './kzg.js', replacement: '../browser/kzg.js'}
    ],
  },
  plugins: [
    // nodePolyfills({
    //   include: ['util', 'fs', 'buffer'],
    // }),
    wasm()
  ],
})

export default config