# KZG-WASM

This module implements a JS wrapper around a WASM compilation of the [`c-kzg-4844`](https://github.com/ethereum/c-kzg-4844) C library built for use with EIP-4844. Starting with v1.0.0, the library also support cell-based operations in the context of EIP-7594 (PeerDAS).

This library is produced by building the original C code to WASM using the [`empscripten`](https://empscripten.org) toolchain in [this fork](https://github.com/ETHCF/c-kzg-4844) of `c-kzg-4844`.

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
