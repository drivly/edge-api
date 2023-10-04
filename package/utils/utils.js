export const base62 = (length) => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const base36 = length => Math.random().toString(36).substring(2, length ? 2 + length : undefined)

export const inverseHex = hex => {
  const hexArray = hex.split('')
  const inverseHexArray = hexArray.map(char => {
    const num = parseInt(char, 16)
    const inverseNum = 15 - num
    const inverseChar = inverseNum.toString(16)
    return inverseChar
  })
  const inverseHex = inverseHexArray.join('')
  return inverseHex
}

export const inverseNow = () => (4500000000000 - Date.now()).toString(36)

export const sha1 = message => hash('SHA-1', message)
export const sha256 = message => hash('SHA-256', message)
export const sha384 = message => hash('SHA-384', message)
export const sha512 = message => hash('SHA-512', message)

export const hash = async (algorithm, message) => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
  return hashHex
}

export const isEmpty = (obj) => typeof(obj) === 'object' && Object.keys(obj).length === 0