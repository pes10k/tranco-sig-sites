const fsLib = require('node:fs/promises')

const csvParseSyncLib = require('csv-parse/sync')

const recordsFromFile = async (pathToTrancoFile) => {
  const fileHandle = await fsLib.open(pathToTrancoFile, 'r')
  const fileContents = await fileHandle.readFile({
    encoding: 'utf8'
  })

  const results = csvParseSyncLib.parse(fileContents)
  await fileHandle.close()
  return results.map(row => [+row[0], row[1]])
}

module.exports = {
  recordsFromFile
}
