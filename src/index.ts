import { hexToBytes } from './util.js'
import kzgWasm from './kzg.js'
import mainnetTrustedSetup from './trustedSetup.js'
export type TrustedSetup = {
    g1: string
    g2: string
    n1: number  // bytes per element
    n2: number  // 65
}
/**
 * Initialization function that instantiates WASM code and returns an object matching the `KZG` interface exposed by `@ethereumjs/util`
 * 
 * @param trustedSetup Optional trusted setup, otherwise official KZG setup from the KZG ceremony is used
 * 
 * @returns object - the KZG methods required for all 4844 related operations
 */
export const loadKZG = async (trustedSetup: TrustedSetup = mainnetTrustedSetup) => {
    const module = await kzgWasm()

    const loadTrustedSetupWasm = module.cwrap('load_trusted_setup_from_wasm', 'number', ['string', 'number','string', 'number']) as (g1: string, n1: number, g2: string, n2: number) => number
    const freeTrustedSetup = module.cwrap('free_trusted_setup_wasm', null, []) as () => void
    const blobToKzgCommitmentWasm = module.cwrap('blob_to_kzg_commitment_wasm', 'string', ['array']) as (blob: Uint8Array) => string
    const computeBlobKzgProofWasm = module.cwrap('compute_blob_kzg_proof_wasm', 'string', ['array', 'array']) as (blob: Uint8Array, commitment: Uint8Array) => string
    const verifyBlobKzgProofWasm = module.cwrap('verify_blob_kzg_proof_wasm', 'string', ['array', 'array', 'array']) as (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => string
    const verifyKzgProofWasm = module.cwrap('verify_kzg_proof_wasm', 'string', ['array', 'array', 'array', 'array']) 

    /**
     * 
     * @param trustedSetup - an optional trusted setup parameter provided by the user
     * @returns 0 if loaded successfully or 1 otherwise
     */
    const loadTrustedSetup = (trustedSetup: TrustedSetup = mainnetTrustedSetup) => {
        return loadTrustedSetupWasm(trustedSetup.g1, trustedSetup.n1, trustedSetup.g2, trustedSetup.n2)
    }
    
    /**
     * 
     * @param blob - a blob of data formatted as a flattened Uint8Array of 4096 big endian KZG field elements
     * @returns a KZG commitment corresponding to the input blob formatted as a 48 byte Uint8Array
     */
    const blobToKzgCommitment = (blob: Uint8Array) => {
        const blobHex = '0x' + blobToKzgCommitmentWasm(blob)
        return hexToBytes(blobHex)
    }

    /**
     * 
     * @param blob  - a blob of data formatted as a flattened Uint8Array of 4096 big endian KZG field elements
     * @param commitment - a KZG commitment corresponding to a blob formatted as a 48 byte Uint8Array
     * @returns a 48 byte KZG proof corresponding to the blob and KZG commitment
     */
    const computeBlobKzgProof = (blob: Uint8Array, commitment: Uint8Array) => {
        const proofHex = '0x' + computeBlobKzgProofWasm(blob, commitment)
        return hexToBytes(proofHex)
    }

    /**
     * 
     * @param blobs - an array of blobs
     * @param commitments - an array of corresponding commitments
     * @param proofs - an array of corresponding KZG proofs
     * @returns returns true if all proofs are verified against their blobs and commitments; false otherise
     */
    const verifyBlobKzgProofBatch = (blobs: Uint8Array[], commitments: Uint8Array[], proofs: Uint8Array[]) => {
        if (blobs.length !== commitments.length && commitments.length !== proofs.length) {
            throw new Error('number of blobs, commitments, and proofs, must match')
        }
        for (let x = 0; x < blobs.length; x++) {
            const res = verifyBlobKzgProofWasm(blobs[x], commitments[x], proofs[x])
            if (res !== 'true') return false
        }
        return true
    }

    /**
     * 
     * @param blob - a blob of data formatted as a flattened Uint8Array of 4096 big endian KZG field elements
     * @param commitment - a 48 byte KZG commitment corresponding to the blob
     * @param proof - a 48 byte KZG proof corresponding to the blob and commitment
     * @returns true if proof is verified; false otherwise
     */
    const verifyBlobKzgProof = (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => {
        const res = verifyBlobKzgProofWasm(blob, commitment, proof)
        return res === 'true'
    }
    /**
     * 
     * @param commitment - a KZG commitment corresponding to two points z and y
     * @param z - an input point 
     * @param y - the output point corresponding to the proof and commitment
     * @param proof 
     * @returns true if proof is verified; false otherwise
     */
    const verifyKzgProof = (commitment: Uint8Array, z: Uint8Array, y: Uint8Array, proof: Uint8Array) => {
        const res = verifyKzgProofWasm(commitment, z, y, proof)
        return res === 'true'
    }

    loadTrustedSetup(trustedSetup)

    return {
        loadTrustedSetup, freeTrustedSetup, blobToKzgCommitment, computeBlobKzgProof, verifyBlobKzgProofBatch, verifyKzgProof, verifyBlobKzgProof
    }
}

