import { hexToBytes } from './util.js'
import kzgWasm from './wasm/kzg.js'

export const createKZG = async () => {
    const module = await kzgWasm()

    const loadTrustedSetup = module.cwrap('load_trusted_setup_file_from_wasm', null, [])
    const freeTrustedSetup = module.cwrap('free_trusted_setup_wasm', null, [])
    const blobToKzgCommitmentWasm = module.cwrap('blob_to_kzg_commitment_wasm', 'string', ['array']) as (blob: Uint8Array) => string
    const computeBlobKzgProofWasm = module.cwrap('compute_blob_kzg_proof_wasm', 'string', ['array', 'array']) as (blob: Uint8Array, commitment: Uint8Array) => string
    const verifyBlobKzgProofWasm = module.cwrap('verify_blob_kzg_proof_wasm', 'number', ['array', 'array', 'array']) as (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => number
    const verifyKzgProofWasm = module.cwrap('verify_kzg_proof_wasm', 'number', ['array', 'array', 'array', 'array'])

    const blobToKzgCommitment = (blob: Uint8Array) => {
        const blobHex = '0x' + blobToKzgCommitmentWasm(blob)
        return hexToBytes(blobHex)
    }

    const computeBlobKzgProof = (blob: Uint8Array, commitment: Uint8Array) => {
        const proofHex = '0x' + computeBlobKzgProofWasm(blob, commitment)
        return hexToBytes(proofHex)
    }

    const verifyBlobKzgProofBatch = (blobs: Uint8Array[], commitments: Uint8Array[], proofs: Uint8Array[]) => {
        if (blobs.length !== commitments.length && commitments.length !== proofs.length) {
            throw new Error('number of blobs, commitments, and proofs, must match')
        }
        for (let x = 0; x < blobs.length; x++) {
            const res = verifyBlobKzgProofWasm(blobs[x], commitments[x], proofs[x])
            if (res !== 0) return false
        }
        return true
    }

    const verifyBlobKzgProof = (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => {
        const res = verifyBlobKzgProofWasm(blob, commitment, proof)
        return res === 0
    }

    const verifyKzgProof = (commitment: Uint8Array, z: Uint8Array, y: Uint8Array, proof: Uint8Array) => {
        const res = verifyKzgProofWasm(commitment, z, y, proof)
        return res === 0
    }
    return {
        loadTrustedSetup, freeTrustedSetup, blobToKzgCommitment, computeBlobKzgProof, verifyBlobKzgProofBatch, verifyKzgProof, verifyBlobKzgProof
    }
}

