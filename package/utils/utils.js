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

export const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => ("00" + b.toString(16)).slice(-2)).join("")
  return hashHex
}

export const isEmpty = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object