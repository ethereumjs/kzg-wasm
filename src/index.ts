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
    const blobToKZGCommitmentWasm = module.cwrap('blob_to_kzg_commitment_wasm', 'string', ['array']) as (blob: Uint8Array) => string
    const computeBlobKZGProofWasm = module.cwrap('compute_blob_kzg_proof_wasm', 'string', ['array', 'array']) as (blob: Uint8Array, commitment: Uint8Array) => string
    const verifyBlobKZGProofWasm = module.cwrap('verify_blob_kzg_proof_wasm', 'string', ['array', 'array', 'array']) as (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => string
    const verifyKZGProofWasm = module.cwrap('verify_kzg_proof_wasm', 'string', ['array', 'array', 'array', 'array']) as (commitment: Uint8Array, z: Uint8Array, y: Uint8Array, proof: Uint8Array) => string

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
     * @param blob - a blob of data formatted as prefixed hex string containing 4096 big endian KZG field elements
     * @returns a KZG commitment corresponding to the input blob formatted as a 48 byte prefixed hex string
     */
    const blobToKZGCommitment = (blob: string) => {
        const blobHex = '0x' + blobToKZGCommitmentWasm(hexToBytes(blob))
        return blobHex
    }

    /**
     * 
     * @param blob  - a blob of data formatted as a flattened prefixed hex string of 4096 big endian KZG field elements
     * @param commitment - a KZG commitment corresponding to a blob formatted as a 48 byte prefixed hex string
     * @returns a 48 byte KZG proof as prefixed hex string corresponding to the blob and KZG commitment
     */
    const computeBlobKZGProof = (blob: string, commitment: string) => {
        const proofHex = '0x' + computeBlobKZGProofWasm(hexToBytes(blob), hexToBytes(commitment))
        return proofHex
    }

    /**
     * 
     * @param blobs - an array of blobs
     * @param commitments - an array of corresponding commitments
     * @param proofs - an array of corresponding KZG proofs
     * @returns returns true if all proofs are verified against their blobs and commitments; false otherwise
     */
    const verifyBlobKZGProofBatch = (blobs: string[], commitments: string[], proofs: string[]) => {
        if (blobs.length !== commitments.length && commitments.length !== proofs.length) {
            throw new Error('number of blobs, commitments, and proofs, must match')
        }
        for (let x = 0; x < blobs.length; x++) {
            const res = verifyBlobKZGProofWasm(hexToBytes(blobs[x]), hexToBytes(commitments[x]), hexToBytes(proofs[x]))
            if (res !== 'true') return false
        }
        return true
    }

    /**
     * 
     * @param blob - a blob of data formatted as a flattened prefixed hex string of 4096 big endian KZG field elements
     * @param commitment - a 48 byte KZG commitment corresponding to the blob formatted as a prefixed hex string
     * @param proof - a 48 byte KZG proof corresponding to the blob and commitment formatted as a prefixed hex string
     * @returns true if proof is verified; false otherwise
     */
    const verifyBlobKZGProof = (blob: string, commitment: string, proof: string) => {
        const res = verifyBlobKZGProofWasm(hexToBytes(blob), hexToBytes(commitment), hexToBytes(proof))
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
    const verifyKZGProof = (commitment: string, z: string, y: string, proof: string) => {
        const res = verifyKZGProofWasm(hexToBytes(commitment), hexToBytes(z), hexToBytes(y), hexToBytes(proof))
        return res === 'true'
    }

    loadTrustedSetup(trustedSetup)

    return {
        loadTrustedSetup, freeTrustedSetup, blobToKZGCommitment, computeBlobKZGProof, verifyBlobKZGProofBatch, verifyKZGProof, verifyBlobKZGProof
    }
}

