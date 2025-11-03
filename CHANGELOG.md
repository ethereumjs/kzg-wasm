# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) 
(modification: no type change headlines) and this project adheres to 
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2025-11-03

Support for both the computation as well as the verification of cell-based proofs in the context of EIP-7594 (PeerDAS), thanks a lot to @n8wb for the generous code contribution! ❤️

Main work being done in PR [#20](https://github.com/ethereumjs/kzg-wasm/pull/20), some follow-up PRs for optimizations and adjustments.

## 0.4.0 - 2024-04-16

- Add browser specific build and corresponding updates to exports map in package.json, PR [#11](https://github.com/ethereumjs/kzg-wasm/pull/11)

## 0.3.1 - 2024-03-14

- Add optional trusted setup parameter to `loadKZG`, PR [#9](https://github.com/ethereumjs/kzg-wasm/pull/9)

## 0.3.0 - 2024-03-14

- Allow optional trusted setup in `loadTrustedSetup`, PR [#7](https://github.com/ethereumjs/kzg-wasm/pull/7)
- Add function docs and update documentation, PR [#6](https://github.com/ethereumjs/kzg-wasm/pull/6)

## 0.2.0 - 2024-03-06

- Reuse WASM file for both ESM and CJS (build size), PR [#3](https://github.com/ethereumjs/kzg-wasm/pull/3)
- Fix a severe bug affecting the results of all exposed methods, PR [#3](https://github.com/ethereumjs/kzg-wasm/pull/3)

## 0.1.0 - 2024-02-28

Initial release of the library

