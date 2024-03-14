import { describe, it, assert, beforeEach } from 'vitest'
import { loadKZG } from '../src/index.js'
import { bytesToHex, hexToBytes } from '../src/util.js'

const BYTES_PER_FIELD_ELEMENT = 4096
const FIELD_ELEMENTS_PER_BLOB = 32
const BYTES_PER_BLOB = BYTES_PER_FIELD_ELEMENT * FIELD_ELEMENTS_PER_BLOB

describe('api tests', () => {
  it('should initialize', async () => {
    const kzg = await loadKZG()
    assert.typeOf(kzg.computeBlobKzgProof, 'function' , 'initialized KZG object')
    kzg.freeTrustedSetup()
  })

  it('should throw on unsuccessful setup initialization', async () => {
    try {
      await loadKZG('test/toast/kzg.txt')
      assert.fail('should not create KZG object')
    } catch(e: any) {
      assert('throws when non-existing path is provided')
    }
  })

  it('should generate kzg commitments and verify proofs', async () => {
    const kzg = await loadKZG()

    const blob = new Uint8Array(BYTES_PER_BLOB)
    blob[0] = 0x01
    blob[1] = 0x02
    const commitment = kzg.blobToKzgCommitment(blob)
    assert.equal(bytesToHex(commitment).slice(2), 'ab87358a111c3cd9da8aadf4b414e9f6be5ac83d923fb70d8d27fef1e2690b4cad015b23b8c058881da78a05c62b1173')
    const proof = kzg.computeBlobKzgProof(blob, commitment)
    assert.equal(bytesToHex(proof).slice(2), '8dd951edb4e0df1779c29d28b835a2cc8b26ebf69a38d7d9afadd0eb8a4cbffd9db1025fd253e91e00a9904f109e81e3')
    const proofVerified = kzg.verifyBlobKzgProofBatch([blob], [commitment], [proof])
    assert.equal(proofVerified, true)
    kzg.freeTrustedSetup()
  })

  it('should verify kzg proofs with points', async () => {
    const kzg = await loadKZG()

    const precompileData = {
      Proof: hexToBytes(
        '0xc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ),
      Commitment: hexToBytes(
        '0xc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ),
      z: hexToBytes(
        '0x623ce31cf9759a5c8daf3a357992f9f3dd7f9339d8998bc8e68373e54f00b75e'
      ),
      y: hexToBytes(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      ),
    }

    const verifiedKzgProof = kzg.verifyKzgProof(precompileData.Commitment, precompileData.z, precompileData.y, precompileData.Proof)
    assert.equal(verifiedKzgProof, true)
    kzg.freeTrustedSetup()
  })
})