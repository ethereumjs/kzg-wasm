import { describe, it, assert, beforeEach } from 'vitest'
import { initKzg } from '../src/index.js'
import { bytesToHex, hexToBytes } from '../src/util.js'

const BYTES_PER_FIELD_ELEMENT = 4096
const FIELD_ELEMENTS_PER_BLOB = 32
const BYTES_PER_BLOB = BYTES_PER_FIELD_ELEMENT * FIELD_ELEMENTS_PER_BLOB

describe('api tests', () => {
  it('should initialize', async () => {
    const kzg = await initKzg()
    const res = kzg.loadTrustedSetup()
    assert.equal(res, 0, 'loaded trusted setup')
    kzg.freeTrustedSetup()

  })
  it('should generate kzg commitments and verify proofs', async () => {
    const kzg = await initKzg()
    kzg.loadTrustedSetup()
    const blob = new Uint8Array(BYTES_PER_BLOB)
    blob[0] = 0x01
    blob[1] = 0x02
    const commitment = kzg.blobToKzgCommitment(blob)
    assert.equal(bytesToHex(commitment).slice(2), 'ab87358a111c3cd9da8aadf4b414e9f6be5ac83d923fb70d8d27fef1e2690b4cad015b23b8c058881da78a05c62b1173')
    const proof = kzg.computeBlobKzgProof(blob, commitment)
    assert.equal(bytesToHex(proof).slice(2), '8dd951edb4e0df1779c29d28b835a2cc8b26ebf69a38d7d9afadd0eb8a4cbffd9db1025fd253e91e00a9904f109e81e3')
    const proofVerified = kzg.verifyBlobKzgProofBatch([blob], [commitment], [proof])
    assert.equal(proofVerified, 0)
    kzg.freeTrustedSetup()
  })
  it('should verify kzg proofs with points', async () => {
    const kzg = await initKzg()
    kzg.loadTrustedSetup()

    const precompileData = {
      Proof: hexToBytes(
        '0x8ad6f539bc7280de6af4c95e7cef39bb6873f18c46ee5eb67299324ee7c6e6da71be2dbd5e2cbafbae4b2d60b40a808c'
      ),
      Commitment: hexToBytes(
        '0xabb6bcbe313530ce7779abdf633d5a3594a41fbad9a79f4a9b46b89c0cfe78f6a15948dec92c4404aedac8b5e7dd6059'
      ),
      z: hexToBytes(
        '0x0000000000000000000000000000000000000000000000000000000000002001'
      ),
      y: hexToBytes(
        '0x0f69060fb771fa559a9e842e1dd79dde8a107486e801707032d93b5965d0cd48'
      ),
    }

    const verifiedKzgProof = kzg.verifyKzgProof(precompileData.Commitment, precompileData.z, precompileData.y, precompileData.Proof)
    assert.equal(verifiedKzgProof, 0)
    kzg.freeTrustedSetup()
  })
})