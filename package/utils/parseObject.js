const 
  stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
  stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
  stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\\w*',
  specials = ',"\'{}()/:[\\]',
  everyThingElse = `[^\\s:,/][^${specials}]*[^\\s${specials}]`,
  oneNotSpace = '[^\\s]',
  token = new RegExp(
    `${stringDouble}|${stringSingle}|${stringRegexp}|${everyThingElse}|${oneNotSpace}`,
    'g'
  ),
  divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
  keywordRegexLookBehind = { in: 1, return: 1, typeof: 1 },
  trim = (string) =>
    string == null
      ? ''
      : string.trim
      ? string.trim()
      : string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')

const parseObjectLiteral = (objectLiteralString) => {
  let str = trim(objectLiteralString)
  if (str.charCodeAt(0) === 123) str = str.slice(1, -1)

  let result = [],
    toks = str.match(token),
    key,
    values = [],
    depth = 0

  if (toks) {
    toks.push(',')
    for (let i = 0, tok; (tok = toks[i]); ++i) {
      const c = tok.charCodeAt(0)
      if (c === 44) {
        if (depth <= 0) {
          if (!key && values.length === 1) {
            key = values.pop()
          }
          result.push([key, values.length ? values.join('') : undefined])
          key = undefined
          values = []
          depth = 0
          continue
        }
      } else if (c === 58) {
        if (!depth && !key && values.length === 1) {
          key = values.pop()
          continue
        }
      } else if (c === 47 && i && tok.length > 1) {
        const match = toks[i - 1].match(divisionLookBehind)
        if (match && !keywordRegexLookBehind[match[0]]) {
          str = str.substr(str.indexOf(tok) + 1)
          toks = str.match(token)
          toks.push(',')
          i = -1
          tok = '/'
        }
      } else if (c === 40 || c === 123 || c === 91) {
        ++depth
      } else if (c === 41 || c === 125 || c === 93) {
        --depth
      } else if (!key && !values.length && (c === 34 || c === 39)) {
        tok = tok.slice(1, -1)
      }
      values.push(tok)
    }
  }
  return result
}

export default parseObjectLiteral
