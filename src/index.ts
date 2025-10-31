import { hexToBytes } from './util.js'
import { loadWasmModule } from './loader.cjs'
import kzgWasm from './kzg.js'
import mainnetTrustedSetup from './trustedSetup.js'

export type TrustedSetup = {
    g1_monomial: string
    g1_lagrange: string
    g2_monomial: string
}

// KZGProofWithCells type represents a KZG proof along with its associated cells
export type KZGProofWithCells = {
    proofs: string[] // Will always be of size 128 with 48 bytes each
    cells: string[] // Will always contain 128 cells with 2048 bytes each
}

/**
 * C code constants
 */
const CELLS_PER_EXT_BLOB = 128
const PROOF_SIZE_BYTES = 48
const BYTES_PER_CELL = 2048

/**
 * Initialization function that instantiates WASM code and returns an object matching the `KZG` interface exposed by `@ethereumjs/util`
 *
 * @param trustedSetup Optional trusted setup, otherwise official KZG setup from the KZG ceremony is used
 *
 * @returns object - the KZG methods required for all 4844 related operations
 */
export const loadKZG = async (precompute: number = 0, trustedSetup: TrustedSetup = mainnetTrustedSetup) => {
    // In Node.js environment, preload the WASM binary to avoid path resolution issues
    let wasmBinary = await loadWasmModule();


    const locateFile = wasmBinary? (path: string) => {
            return path
        } : undefined

    const module = await kzgWasm({
        wasmBinary,
        locateFile,
    });

    const loadTrustedSetupWasm = module.cwrap('load_trusted_setup_wasm', 'number', ['array', 'array','array', 'number']) as (g1Monomial: Uint8Array,g1Lagrange: Uint8Array,  g2Monomial: Uint8Array, precompute: number) => number;
    const freeTrustedSetup = module.cwrap('free_trusted_setup_wasm', null, []) as () => void;
    const blobToKZGCommitmentWasm = module.cwrap('blob_to_kzg_commitment_wasm', 'string', ['array']) as (blob: Uint8Array) => string;
    const computeBlobKZGProofWasm = module.cwrap('compute_blob_kzg_proof_wasm', 'string', ['array', 'array']) as (blob: Uint8Array, commitment: Uint8Array) => string;
    const verifyBlobKZGProofWasm = module.cwrap('verify_blob_kzg_proof_wasm', 'string', ['array', 'array', 'array']) as (blob: Uint8Array, commitment: Uint8Array, proof: Uint8Array) => string;
    const verifyKZGProofWasm = module.cwrap('verify_kzg_proof_wasm', 'string', ['array', 'array', 'array', 'array']) as (commitment: Uint8Array, z: Uint8Array, y: Uint8Array, proof: Uint8Array) => string;
    const computeCellsAndKZGProofsWasm = module.cwrap('compute_cells_and_kzg_proofs_wasm', 'string', ['array']) as (blob: Uint8Array) => string;
    const recoverCellsFromKZGProofsWasm = module.cwrap('recover_cells_and_kzg_proofs_wasm', 'string', ['array', 'array', 'number']) as (cellIndices: Uint8Array, cells: Uint8Array, numCells: number) => string;
    const verifyCellKZGProofWasm = module.cwrap('verify_cell_kzg_proof_wasm', 'string', ['array', 'array', 'array']) as (commitment: Uint8Array,  cellsBytes: Uint8Array, proofBytes: Uint8Array) => string;
    const verifyCellKZGProofBatchWasm = module.cwrap('verify_cell_kzg_proof_batch_wasm', 'string', ['array', 'array', 'array', 'array', 'number']) as (commitmentsBytes: Uint8Array, cellIndices: Uint8Array, cells: Uint8Array, proofBytes: Uint8Array, numCells: number) => string;
    /**
     * 
     * @param trustedSetup - an optional trusted setup parameter provided by the user
     * @returns 0 if loaded successfully or non zero otherwise
     */
    const loadTrustedSetup = (precompute: number = 0, trustedSetup: TrustedSetup = mainnetTrustedSetup) => {
        if(trustedSetup.g1_monomial.length != 48 * 4096 * 2) {
            throw new Error(`trusted setup g1_monomial must be 48 * 4096  bytes long, not ${trustedSetup.g1_monomial.length}`)
        }
        if(trustedSetup.g1_lagrange.length != 48 * 4096 * 2) {
            throw new Error(`trusted setup g1_lagrange must be 48 * 4096 bytes long, not ${trustedSetup.g1_lagrange.length}`)
        }
        if(trustedSetup.g2_monomial.length != 65 * 96 * 2) {
            throw new Error(`trusted setup g2_monomial must be 65 * 96  bytes long, not ${trustedSetup.g2_monomial.length}`)
        }
        const g1Monomial = hexToBytes("0x" + trustedSetup.g1_monomial)
        const g1Lagrange = hexToBytes("0x" + trustedSetup.g1_lagrange)
        const g2Monomial = hexToBytes("0x" + trustedSetup.g2_monomial)
        return loadTrustedSetupWasm(g1Monomial, g1Lagrange, g2Monomial, precompute);
    }

    
    /**
     * Converts a blob of data into a KZG commitment.
     * @param blob - a blob of data formatted as prefixed hex string containing 4096 big endian KZG field elements
     * @returns a KZG commitment corresponding to the input blob formatted as a 48 byte prefixed hex string
     */
    const blobToKZGCommitment = (blob: string) => {
        const result = blobToKZGCommitmentWasm(hexToBytes(blob))
        if (result === "invalid argument" || result === "unable to allocate memory" || result === "internal error") {
            throw new Error(result);
        }
        return '0x' + result;
    }

    

    /**
     * 
     * @param blob  - a blob of data formatted as a flattened prefixed hex string of 4096 big endian KZG field elements
     * @param commitment - a KZG commitment corresponding to a blob formatted as a 48 byte prefixed hex string
     * @returns a 48 byte KZG proof as prefixed hex string corresponding to the blob and KZG commitment
     */
    const computeBlobKZGProof = (blob: string, commitment: string) => {
        const result = computeBlobKZGProofWasm(hexToBytes(blob), hexToBytes(commitment));
        if (result === "invalid argument" || result === "unable to allocate memory" || result === "internal error") {
            throw new Error(result);
        }
        return '0x' + result;
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

    const computeCellsAndKZGProofs = (blob: string): KZGProofWithCells => {
        const result = computeCellsAndKZGProofsWasm(hexToBytes(blob))
        if (result === "invalid argument" || result === "unable to allocate memory" || result === "internal error") {
            throw new Error(result);
        }
        // Proof is 48 bytes, each cell is 2048 bytes and there are 128 cells. Multiplied by 2 for hex representation
        if (result.length != 2 * ((PROOF_SIZE_BYTES*CELLS_PER_EXT_BLOB) + (CELLS_PER_EXT_BLOB * BYTES_PER_CELL))) {
            // Likely an unhandled error
            throw new Error(`Failed to compute cells and KZG proofs: ${result}`);
        }
        const proofs: string[]  = [];
        for (let i = 0; i < CELLS_PER_EXT_BLOB; i++) {
            const proofHex = '0x' + result.slice(i * PROOF_SIZE_BYTES * 2, (i + 1) * PROOF_SIZE_BYTES * 2);
            proofs.push(proofHex);
        }
        const cells: string[] = [];
        const proofs_offset = (PROOF_SIZE_BYTES * CELLS_PER_EXT_BLOB) * 2;
        for (let i = 0; i < CELLS_PER_EXT_BLOB; i++) {
            const cellHex = '0x' + result.slice((proofs_offset + (i * BYTES_PER_CELL * 2)), (proofs_offset + ((i + 1) * BYTES_PER_CELL * 2)));
            cells.push(cellHex);
        }

        return {
            proofs,
            cells
        };
    }

    /**
     * 
     * @param cellIndices The original indexes of each partial cell if they were in a complete list of cells
     * @param partial_cells The partial cells from which to recover all of the cells (must be atleast 50% of total cells)
     * @param numCells The length of partial_cells
     * @returns 
     */
    const recoverCellsFromKZGProofs = (cellIndices: number[], partial_cells: string[], numCells: number):KZGProofWithCells  => {

        const cellIndicesFlat = new Uint8Array(numCells * 8);
        for (let i = 0; i < numCells; i++) {
            if (cellIndices[i] < 0 || cellIndices[i] >= CELLS_PER_EXT_BLOB) {
                throw new Error(`cell index ${cellIndices[i]} at position ${i} is out of range [0, ${CELLS_PER_EXT_BLOB})`);
            }
            cellIndicesFlat[i * 8] = cellIndices[i] & 0xFF;
            cellIndicesFlat[i * 8 + 1] = (cellIndices[i] >> 8) & 0xFF;
            cellIndicesFlat[i * 8 + 2] = (cellIndices[i] >> 16) & 0xFF;
            cellIndicesFlat[i * 8 + 3] = (cellIndices[i] >> 24) & 0xFF;
            // High 4 bytes are zero
            cellIndicesFlat[i * 8 + 4] = 0;
            cellIndicesFlat[i * 8 + 5] = 0;
            cellIndicesFlat[i * 8 + 6] = 0;
            cellIndicesFlat[i * 8 + 7] = 0;
        }

        const cellsBytes = partial_cells.map((c) => hexToBytes(c));
        // Flatten cells array into a single contiguous Uint8Array
        const flatCells = new Uint8Array(numCells * BYTES_PER_CELL); // Each cell is 2048 bytes
        for (let i = 0; i < numCells; i++) {
            flatCells.set(cellsBytes[i], i * BYTES_PER_CELL);
        }

        const result = recoverCellsFromKZGProofsWasm(cellIndicesFlat, flatCells, numCells);
        if (result === "invalid argument" || result === "unable to allocate memory" || result === "internal error") {
            throw new Error(result);
        }
        // Proof is 48 * 128 bytes, each cell is 2048 bytes and there are 128 cells. Multiplied by 2 for hex representation
        if (result.length != 2 * ((PROOF_SIZE_BYTES*CELLS_PER_EXT_BLOB) + (CELLS_PER_EXT_BLOB * BYTES_PER_CELL))) {
            // Likely an unhandled error
            throw new Error(`Failed to recover cells and KZG proofs: ${result}`);
        }
        const proofs: string[]  = [];
        for (let i = 0; i < CELLS_PER_EXT_BLOB; i++) {
            const proofHex = '0x' + result.slice(i * PROOF_SIZE_BYTES * 2, (i + 1) * PROOF_SIZE_BYTES * 2);
            proofs.push(proofHex);
        }
        const cells: string[] = [];
         const proofs_offset = (PROOF_SIZE_BYTES * CELLS_PER_EXT_BLOB) * 2;
        for (let i = 0; i < CELLS_PER_EXT_BLOB; i++) {
            const cellHex = '0x' + result.slice((proofs_offset + (i * BYTES_PER_CELL * 2)), (proofs_offset + ((i + 1) * BYTES_PER_CELL * 2)));
            cells.push(cellHex);
        }

        return {
            proofs,
            cells
        };
    }
    const verifyCellKZGProof = (commitment: string, cells: string[], proofs: string[]) => {
        const cellsBytes = cells.map((c) => hexToBytes(c));
        const proofBytes = proofs.map((p) => hexToBytes(p));

        const cellsBytesFlat = new Uint8Array(cells.length * BYTES_PER_CELL); // Each cell is 2048 bytes
        for (let i = 0; i < cells.length; i++) {
            cellsBytesFlat.set(cellsBytes[i], i * BYTES_PER_CELL);
        }

        const proofBytesFlat = new Uint8Array(proofBytes.length * PROOF_SIZE_BYTES); // Each proof is 48 bytes
        for (let i = 0; i < proofs.length; i++) {
            proofBytesFlat.set(proofBytes[i], i * PROOF_SIZE_BYTES);
        }
        const res = verifyCellKZGProofWasm(hexToBytes(commitment), cellsBytesFlat, proofBytesFlat)
        return res === 'true'
    }

    const verifyCellKZGProofBatch = (commitments: string[], cellIndices: number[], cells: string[], proofs: string[], numCells: number) => {
        if (commitments.length !== cellIndices.length && cellIndices.length !== cells.length && cells.length !== proofs.length) {
            throw new Error('number of commitments, cell indices, cells, and proofs must match')
        }
        if (cells.length !== numCells) {
            throw new Error('numCells must match the number of cells provided')
        }
        const commitmentsBytes = commitments.map((c) => hexToBytes(c));
        const cellsBytes = cells.map((c) => hexToBytes(c));
        const proofBytes = proofs.map((p) => hexToBytes(p));

        const commitmentsBytesFlat = new Uint8Array(commitments.length * 48); // Each cell is 48 bytes
        for (let i = 0; i < numCells; i++) {
            commitmentsBytesFlat.set(commitmentsBytes[i], i * 48);
        }

        const cellIndicesFlat = new Uint8Array(numCells * 8);
        for (let i = 0; i < numCells; i++) {
            if (cellIndices[i] < 0 || cellIndices[i] >= CELLS_PER_EXT_BLOB) {
                throw new Error(`cell index ${cellIndices[i]} at position ${i} is out of range [0, ${CELLS_PER_EXT_BLOB})`);
            }
            cellIndicesFlat[i * 8] = cellIndices[i] & 0xFF;
            cellIndicesFlat[i * 8 + 1] = (cellIndices[i] >> 8) & 0xFF;
            cellIndicesFlat[i * 8 + 2] = (cellIndices[i] >> 16) & 0xFF;
            cellIndicesFlat[i * 8 + 3] = (cellIndices[i] >> 24) & 0xFF;
            // High 4 bytes are zero
            cellIndicesFlat[i * 8 + 4] = 0;
            cellIndicesFlat[i * 8 + 5] = 0;
            cellIndicesFlat[i * 8 + 6] = 0;
            cellIndicesFlat[i * 8 + 7] = 0;
        }

        const cellsBytesFlat = new Uint8Array(cells.length * BYTES_PER_CELL); // Each cell is 2048 bytes
        for (let i = 0; i < numCells; i++) {
            cellsBytesFlat.set(cellsBytes[i], i * BYTES_PER_CELL);
        }

        const proofBytesFlat = new Uint8Array(proofBytes.length * PROOF_SIZE_BYTES); // Each proof is 48 bytes
        for (let i = 0; i < numCells; i++) {
            proofBytesFlat.set(proofBytes[i], i * PROOF_SIZE_BYTES);
        }

        const res = verifyCellKZGProofBatchWasm(commitmentsBytesFlat, cellIndicesFlat, cellsBytesFlat, proofBytesFlat, numCells)
        return res === 'true'
    }

    const loadResult = loadTrustedSetup(precompute, trustedSetup);
    if (loadResult !== 0) {
        throw new Error(`Failed to load trusted setup, error code: ${loadResult}`);
    }


    // ALIASING
    const computeBlobProof = computeBlobKZGProof // Alias with different casing for ethereumjs compatibility
    const blobToKzgCommitment = blobToKZGCommitment // Alias with different casing for ethereumjs compatibility
    const verifyProof = verifyKZGProof // Alias with different casing for ethereumjs compatibility

    const verifyCellKzgProofBatch = (commitments: string[], cellIndices: number[], cells: string[], proofs: string[]) => {
        return verifyCellKZGProofBatch(commitments, cellIndices, cells, proofs, cells.length)
    }

    const recoverCellsAndProofs = (indices: number[], cells: string[]): [string[], string[]] => {
        const result = recoverCellsFromKZGProofs(indices, cells, cells.length);
        return [result.cells, result.proofs];
    }

    const computeCells = (blob: string): string[] => {
        const result = computeCellsAndKZGProofs(blob);
        return result.cells;
    }

    const computeCellsAndProofs = (blob: string): [string[], string[]] => {
        const result = computeCellsAndKZGProofs(blob);
        return [result.cells, result.proofs];
    }

    const verifyBlobProofBatch = verifyBlobKZGProofBatch

    return {
        loadTrustedSetup, freeTrustedSetup, blobToKZGCommitment, computeBlobKZGProof, verifyBlobKZGProofBatch, verifyKZGProof, verifyBlobKZGProof,
        computeCellsAndKZGProofs, recoverCellsFromKZGProofs, verifyCellKZGProof, verifyCellKZGProofBatch, 
        // ALIASED/KZGJS COMPATIBILITY METHODS
        verifyCellKzgProofBatch, recoverCellsAndProofs, computeCells, computeCellsAndProofs, verifyBlobProofBatch, 
        computeBlobProof, blobToKzgCommitment, verifyProof
    }
}

