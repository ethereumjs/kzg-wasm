

export async function loadWasmModule() {
    let wasmBinary = undefined
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
        // Dynamically import Node.js modules only when in Node.js environment
        const { resolve } = await import('path')
        const { readFileSync } = await import('fs')
        const wasmPath = resolve(__dirname, '../wasm/kzg.wasm')
        const buffer = readFileSync(wasmPath)
        // Convert Node.js Buffer to ArrayBuffer
        wasmBinary = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }
    return wasmBinary
}

