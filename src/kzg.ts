// @ts-ignore
import kzgWasm from './wasm/kzg.js'

const module = await kzgWasm()

const loadTrustedSetup = module.cwrap('load_trusted_setup_file_from_wasm', null,[] )
const freeTrustedSetup = module.cwrap('free_trusted_setup_wasm', null,[] )
const blobToKzgCommit = module.cwrap('blob_to_kzg_commitment_wasm', 'string',['array'] ) as (blob: Uint8Array) => string
const computeBlobKzgProof = module.cwrap('compute_blob_kzg_proof_wasm', 'string',['array', 'array'] ) as (blob: Uint8Array, commitment: Uint8Array) => string
const verifyBlobKzgProof = module.cwrap('verify_blob_kzg_proof_wasm', 'number', ['array', 'array', 'array']) as (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => number
const verifyKzgProof = module.cwrap('verify_kzg_proof_wasm', 'number', ['array', 'array', 'array','array']) 

export const kzg = {
    loadTrustedSetup, freeTrustedSetup, blobToKzgCommit, computeBlobKzgProof, verifyBlobKzgProof, verifyKzgProof
}

