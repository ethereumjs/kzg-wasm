# KZG-WASM

This module implements a JS wrapper around a WASM compilation of the [`c-kzg-4844`](https://github.com/ethereum/c-kzg-4844) C library built for use with EIP-4844.

This library is produced by building the original C code to WASM using the [`empscripten`](https://empscripten.org) toolchain in [this fork and branch](https://github.com/acolytec3/c-kzg-4844/tree/wasm) of `c-kzg-4844`.

## Usage

This module exposes a single export, an async function called `createKZG` which loads and compiles the WASM object and returns an object that exposes the API defined in the `KZG` type interface in [`@ethereum/util`](https://github.com/ethereumjs/ethereumjs-monorepo/blob/e1221c98f3be0ba4224416f10d91ed4aa50130d8/packages/util/src/kzg.ts#L4)

To use with the `@ethereumjs` libraries, do the following:

```ts
import { createKZG } from 'kzg-wasm'
import { Common, Chain, Hardfork } from '@ethereumjs/common'
import { initKZG } from '@ethereumjs/util'

const main = async () => {
    const kzg = await createKZG()
    initKZG(kzg, '')
    const common = new Common({
        chain: Chain.Mainnet,
        hardfork: Hardfork.Cancun,
        customCrypto: { kzg: kzg },
    })
    console.log(common.customCrypto.kzg) // Should print the initialized KZG interface
}

main()
```
