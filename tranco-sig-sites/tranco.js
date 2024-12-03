const fsLib = require('node:fs/promises')

const csvParseSyncLib = require('csv-parse/sync')

const throwParseError = (filepath, rowNum, colNum, expectedDesc, value) => {
  const errorMsg = [
    `Error parsing ${filepath}, row ${rowNum}`,
    `- Expected to find ${expectedDesc} in column ${colNum}`,
    `- Found text on row: "${value}"`
  ]
  throw new Error(errorMsg.join('\n'))
}

const INVALID_DOMAIN_SUBSTRINGS = [
  '//', '?', '#', ':'
]

// Perform extremely simple validation of the expected format
// of the domain value. Basically, that we don't see a protocol,
// and that we do see at least one '.' (e.g., its not only a TLD like
// 'org').
const validateTrancoDomain = (possibleDomain) => {
  for (const anUnexpectedSubstring of INVALID_DOMAIN_SUBSTRINGS) {
    if (possibleDomain.includes(anUnexpectedSubstring)) {
      return false
    }
  }
  if (possibleDomain.includes('.') === false) {
    return false
  }
  return true
}

const recordsFromFile = async (pathToTrancoFile) => {
  const throwError = throwParseError.bind(undefined, pathToTrancoFile)
  const fileHandle = await fsLib.open(pathToTrancoFile, 'r')
  const fileContents = await fileHandle.readFile({
    encoding: 'utf8'
  })

  const results = csvParseSyncLib.parse(fileContents)
  await fileHandle.close()

  const ranksAndDomains = []
  let rowNum = 0
  for (const row of results) {
    const [possibleRank, possibleDomain] = row
    rowNum += 1
    if (Number.isInteger(+possibleRank) === false) {
      throwError(rowNum, 0, 'domain rank as an integer', row)
    }

    if (validateTrancoDomain(possibleDomain) === false) {
      throwError(rowNum, 1, 'domain', row)
    }
    ranksAndDomains.push([+possibleRank, possibleDomain])
  }
  return ranksAndDomains
}

module.exports = {
  recordsFromFile
}
