/****************  Borrowed from @chainsafe/ssz */
// Caching this info costs about ~1000 bytes and speeds up toHexString() by x6
const hexByByte = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'))

export const bytesToHex = (bytes: Uint8Array): string => {
  let hex = '0x'
  if (bytes === undefined || bytes.length === 0) return hex
  for (const byte of bytes) {
    hex += hexByByte[byte]
  }
  return hex
}

/**
 * Pads a `String` to have an even length
 * @param value
 * @return output
 */
export function padToEven(value: string): string {
    let a = value
  
    if (typeof a !== 'string') {
      throw new Error(`[padToEven] value must be type 'string', received ${typeof a}`)
    }
  
    if (a.length % 2) a = `0${a}`
  
    return a
  }

// hexToBytes cache
const hexToBytesMapFirstKey: { [key: string]: number } = {}
const hexToBytesMapSecondKey: { [key: string]: number } = {}

for (let i = 0; i < 16; i++) {
  const vSecondKey = i
  const vFirstKey = i * 16
  const key = i.toString(16).toLowerCase()
  hexToBytesMapSecondKey[key] = vSecondKey
  hexToBytesMapSecondKey[key.toUpperCase()] = vSecondKey
  hexToBytesMapFirstKey[key] = vFirstKey
  hexToBytesMapFirstKey[key.toUpperCase()] = vFirstKey
}

  function _unprefixedHexToBytes(hex: string): Uint8Array {
    const byteLen = hex.length
    const bytes = new Uint8Array(byteLen / 2)
    for (let i = 0; i < byteLen; i += 2) {
      bytes[i / 2] = hexToBytesMapFirstKey[hex[i]] + hexToBytesMapSecondKey[hex[i + 1]]
    }
    return bytes
  }
export const hexToBytes = (hex: string): Uint8Array => {
    if (typeof hex !== 'string') {
      throw new Error(`hex argument type ${typeof hex} must be of type string`)
    }
  
    if (!/^0x[0-9a-fA-F]*$/.test(hex)) {
      throw new Error(`Input must be a 0x-prefixed hexadecimal string, got ${hex}`)
    }
  
    hex = hex.slice(2)
  
    if (hex.length % 2 !== 0) {
      hex = padToEven(hex)
    }
    return _unprefixedHexToBytes(hex)
  }