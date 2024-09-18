import { describe, it, assert, beforeAll } from 'vitest'
import { loadKZG } from '../src/index.js'
import { bytesToHex, hexToBytes } from '../src/util.js'

const BYTES_PER_FIELD_ELEMENT = 4096
const FIELD_ELEMENTS_PER_BLOB = 32
const BYTES_PER_BLOB = BYTES_PER_FIELD_ELEMENT * FIELD_ELEMENTS_PER_BLOB

describe('kzg initialization', () => {
  let kzg
  beforeAll(async () => {
    kzg = await loadKZG()
  })

  it('should initialize', async () => {
    assert.typeOf(kzg.computeBlobKZGProof, 'function', 'initialized KZG object')
    kzg.freeTrustedSetup()
  })
  it('should return nonzero when invalid trusted setup is provided', () => {
    const res = kzg.loadTrustedSetup({ g1: 'x12', n1: -1, g2: 'bad coordinates', n2: 0 })
    assert.notOk(res === 0)
  })
})

describe('kzg API tests', () => {
  let kzg: Awaited<ReturnType<typeof loadKZG>>
  beforeAll(async () => {
    kzg = await loadKZG()
  })

  it('should generate kzg commitments and verify proofs', async () => {
    const blob = new Uint8Array(BYTES_PER_BLOB)
    blob[0] = 0x01
    blob[1] = 0x02
    const commitment = kzg.blobToKZGCommitment(bytesToHex(blob))
    assert.equal(commitment.slice(2).toLowerCase(), 'ab87358a111c3cd9da8aadf4b414e9f6be5ac83d923fb70d8d27fef1e2690b4cad015b23b8c058881da78a05c62b1173')
    const proof = kzg.computeBlobKZGProof(bytesToHex(blob), (commitment))
    assert.equal(proof.toLowerCase(), '0x8dd951edb4e0df1779c29d28b835a2cc8b26ebf69a38d7d9afadd0eb8a4cbffd9db1025fd253e91e00a9904f109e81e3')
    const proofVerified = kzg.verifyBlobKZGProofBatch([bytesToHex(blob)], [(commitment)], [proof])
    assert.equal(proofVerified, true)
  })

  it('should verify kzg proofs with points', async () => {
    const precompileData = {
      Proof: (
        '0xc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ),
      Commitment: (
        '0xc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ),
      z: (
        '0x623ce31cf9759a5c8daf3a357992f9f3dd7f9339d8998bc8e68373e54f00b75e'
      ),
      y: (
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      ),
    }

    const verifiedKZGProof = kzg.verifyKZGProof(precompileData.Commitment, precompileData.z, precompileData.y, precompileData.Proof)
    assert.equal(verifiedKZGProof, true)
  })
})