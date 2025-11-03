# KZG-WASM

| WASM wrapper library for KZG/EIP-4844/PeerDAS functionality. |
| ------------------------------------------------------------ |

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Performance Comparison](#performance-comparison)
- [Development](#development)
- [License](#license)

## Introduction

This module implements a JS wrapper around a WASM compilation of the [`c-kzg-4844`](https://github.com/ethereum/c-kzg-4844) C library built for use with EIP-4844. Starting with v1.0.0, the library also support cell-based operations in the context of EIP-7594 (PeerDAS).

This library is produced by building the original C code to WASM using the [`empscripten`](https://empscripten.org) toolchain in [this fork](https://github.com/ETHCF/c-kzg-4844) of `c-kzg-4844`.

If you are looking for a pure JS implementation of KZG/EIP-4844/PeerDAS functionality, check out the [`micro-eth-signer`](https://github.com/paulmillr/micro-eth-signer) library. For a comparison on how these libraries roughly compare in terms of performance, see the [Performance Comparison](#performance-comparison) section.

## Usage

This module exposes a single export, an async function called `loadKZG` which loads and compiles the WASM object, loads a trusted setup (defaults to the official setup from the KZG ceremony) and returns an object that exposes the API defined in the `KZG` type interface in `@ethereumjs/util`

To use with the `@ethereumjs` libraries, do the following:

```ts
import { loadKZG } from 'kzg-wasm'
import { Common, Chain, Hardfork } from '@ethereumjs/common'

const main = async () => {
    const kzg = await loadKZG()
    const common = new Common({
        chain: Chain.Mainnet,
        hardfork: Hardfork.Cancun,
        customCrypto: { kzg },
    })
    console.log(common.customCrypto.kzg) // Should print the initialized KZG interface
}

main()
```

## API Reference

The `loadKZG()` function returns an object that implements the KZG interface with the following methods:

### Core KZG Operations (EIP-4844)

#### `loadTrustedSetup(trustedSetup?, precompute?)`
```ts
loadTrustedSetup(trustedSetup: TrustedSetup = mainnetTrustedSetup, precompute: number = 0): number
```
Loads a trusted setup for KZG operations. Returns 0 on success, non-zero on failure.

#### `freeTrustedSetup()`
```ts
freeTrustedSetup(): void
```
Frees the loaded trusted setup from memory.

#### `blobToKZGCommitment(blob)`
```ts
blobToKZGCommitment(blob: string): string
```
Converts a blob of data into a KZG commitment. Takes a prefixed hex string containing 4096 big endian KZG field elements and returns a 48-byte KZG commitment as a prefixed hex string.

#### `computeBlobKZGProof(blob, commitment)`
```ts
computeBlobKZGProof(blob: string, commitment: string): string
```
Computes a KZG proof for a blob and its commitment. Returns a 48-byte KZG proof as a prefixed hex string.

#### `verifyBlobKZGProof(blob, commitment, proof)`
```ts
verifyBlobKZGProof(blob: string, commitment: string, proof: string): boolean
```
Verifies a KZG proof against a blob and its commitment. Returns `true` if the proof is valid, `false` otherwise.

#### `verifyBlobKZGProofBatch(blobs, commitments, proofs)`
```ts
verifyBlobKZGProofBatch(blobs: string[], commitments: string[], proofs: string[]): boolean
```
Verifies multiple KZG proofs in batch. All arrays must have the same length. Returns `true` if all proofs are valid, `false` otherwise.

#### `verifyKZGProof(commitment, z, y, proof)`
```ts
verifyKZGProof(commitment: string, z: string, y: string, proof: string): boolean
```
Verifies a KZG proof for specific points z and y against a commitment. Returns `true` if the proof is valid, `false` otherwise.

### Cell-based Operations (EIP-7594)

#### `computeCellsAndKZGProofs(blob)`
```ts
computeCellsAndKZGProofs(blob: string): KZGProofWithCells
```
Computes all 128 cells and their corresponding KZG proofs for a blob. Returns an object containing arrays of proofs and cells.

#### `recoverCellsFromKZGProofs(cellIndices, partialCells, numCells)`
```ts
recoverCellsFromKZGProofs(cellIndices: number[], partialCells: string[], numCells: number): KZGProofWithCells
```
Recovers all cells and proofs from partial cell data. Requires at least 50% of the total cells to be provided. Returns the complete set of proofs and cells.

#### `verifyCellKZGProof(commitment, cells, proofs)`
```ts
verifyCellKZGProof(commitment: string, cells: string[], proofs: string[]): boolean
```
Verifies KZG proofs for specific cells against a commitment. Returns `true` if all proofs are valid, `false` otherwise.

#### `verifyCellKZGProofBatch(commitments, cellIndices, cells, proofs, numCells)`
```ts
verifyCellKZGProofBatch(commitments: string[], cellIndices: number[], cells: string[], proofs: string[], numCells: number): boolean
```
Verifies multiple cell KZG proofs in batch. All arrays must have the same length and match `numCells`. Returns `true` if all proofs are valid, `false` otherwise.

### Compatibility Aliases

The library also provides aliases for compatibility with different naming conventions:

- `blobToKzgCommitment` - alias for `blobToKZGCommitment`
- `computeBlobProof` - alias for `computeBlobKZGProof`

### Types

#### `TrustedSetup`
```ts
type TrustedSetup = {
    g1_monomial: string
    g1_lagrange: string
    g2_monomial: string
}
```

#### `KZGProofWithCells`
```ts
type KZGProofWithCells = {
    proofs: string[] // Array of 128 proofs, each 48 bytes
    cells: string[]  // Array of 128 cells, each 2048 bytes
}
```

## Performance Comparison

The following numbers can give you some idea of the performance of the library. Note that these are rather "napkin numbers" and no benchmarks (30 runs each using Chrome), but they should nevertheless give you an idea if this wrapper library is a good fit for your use case.

```shell
WASM KZG: 27.866666666666667 ms per commitment
JS KZG: 4.466666666666667 ms per commitment
WASM KZG: 276.06666666666666 ms per proof
JS KZG: 644.7666666666667 ms per proof
WASM KZG: 12.233333333333333 ms per verify proof
JS KZG: 28.333333333333332 ms per verify proof
```

## Development

### Build Process

This section outlines the build scripts included in this repository to create distributable JavaScript/TypeScript packages from the WASM compilation.

#### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16+)
- **npm** 
- **TypeScript** (installed as dev dependency)
- **Babel** (installed as dev dependency)

#### Build Scripts Overview

The repository includes the following build scripts:

1. **`build`** - Main build command
2. **`build:ts`** - TypeScript compilation to multiple targets
3. **`transpileCJS`** - Babel transpilation for CommonJS compatibility
4. **`fixRequire`** - Fix dynamic require statements
5. **`fixWasmDirInNode`** - Fix WASM paths for Node.js builds
6. **`fixWasmDirInWeb`** - Fix WASM paths for browser builds

#### Script Details

**`build:ts`** (`scripts/ts-build.sh`)
- Copies WASM file to `dist/wasm/`
- Compiles TypeScript to CommonJS (`dist/cjs/`)
- Compiles TypeScript to ESM (`dist/esm/`)
- Creates browser build (`dist/browser/`)

**`transpileCJS`**
- Uses Babel to transpile `src/kzg.js` to `dist/cjs/`
- Ensures CommonJS compatibility

**`fixRequire`**
- Fixes dynamic require statements in CommonJS build
- Replaces `\_require('url')` with `require('url')`

**`fixWasmDirInNode`**
- Updates WASM file paths in Node.js builds
- Changes `kzg-node.wasm` → `kzg.wasm` → `../wasm/kzg.wasm`

**`fixWasmDirInWeb`**
- Updates WASM file paths in browser builds
- Changes `kzg-web.wasm` → `../wasm/kzg.wasm`

#### Build Output Structure

```
dist/
├── cjs/           # CommonJS build for Node.js
│   ├── index.js
│   ├── kzg.js
│   ├── loader.cjs
│   └── package.json
├── esm/           # ES Modules build
│   ├── index.js
│   ├── kzg.js
│   ├── loader.mjs
│   └── package.json
├── browser/       # Browser build
│   ├── index.js
│   ├── kzg.js
│   └── package.json
└── wasm/          # WASM binary
    └── kzg.wasm
```

#### Testing Builds

```bash
# Test all builds
npm test

# Test specific builds
npm run test:dist    # Test distribution build
npm run test:src     # Test source code
npm run test:browser # Test browser environment
```

