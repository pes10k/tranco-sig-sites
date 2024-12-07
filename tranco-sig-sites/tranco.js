const csvParseLib = require('csv-parse')

const throwParseError = (rowNum, colNum, expectedDesc, value) => {
  const errorMsg =
    `Error parsing CSV file, row ${rowNum}\n.` +
    `Expected to find ${expectedDesc} in col ${colNum}, but found : "${value}"`
  throw new Error(errorMsg)
}

const invalidDomainSubstrings = [
  '//', '?', '#', ':'
]

// Perform extremely simple validation of the expected format
// of the domain value. Basically, that we don't see a protocol,
// and that we do see at least one '.' (e.g., its not only a TLD like
// 'org').
const validateTrancoDomain = (possibleDomain) => {
  for (const anUnexpectedSubstring of invalidDomainSubstrings) {
    if (possibleDomain.includes(anUnexpectedSubstring)) {
      return false
    }
  }
  if (possibleDomain.includes('.') === false) {
    return false
  }
  return true
}

const recordsFromFile = async (trancoFileReadStream) => {
  const parser = trancoFileReadStream.pipe(csvParseLib.parse())
  const ranksAndDomains = []
  let rowNum = 0
  for await (const row of parser) {
    const [possibleRank, possibleDomain] = row
    rowNum += 1
    if (Number.isInteger(+possibleRank) === false) {
      throwParseError(rowNum, 0, 'domain rank as an integer', row)
    }

    if (validateTrancoDomain(possibleDomain) === false) {
      throwParseError(rowNum, 1, 'domain', row)
    }
    ranksAndDomains.push([+possibleRank, possibleDomain])
  }
  return ranksAndDomains
}

module.exports = {
  recordsFromFile
}
