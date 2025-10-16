# KZG-WASM

This module implements a JS wrapper around a WASM compilation of the [`c-kzg-4844`](https://github.com/ethereum/c-kzg-4844) C library built for use with EIP-4844.

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
