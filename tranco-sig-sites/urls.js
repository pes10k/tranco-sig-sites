const commonPrefixes = new Set([
  'www.'
])

const processUrl = (url, stripCommonPrefixes = true, stripParams = true,
  stripScheme = true) => {
  const newUrl = new URL(url)
  if (stripCommonPrefixes) {
    for (const aPrefix of commonPrefixes) {
      if (newUrl.hostname.startsWith(aPrefix)) {
        newUrl.hostname = newUrl.hostname.substring(aPrefix.length)
        break
      }
    }
  }

  if (stripParams) {
    newUrl.search = ''
  }

  if (stripScheme) {
    newUrl.protocol = ''
  }

  if (newUrl.port) {
    if (newUrl.protocol === 'https:' && newUrl.port === '443') {
      newUrl.port = ''
    } else if (newUrl.protocol === 'http:' && newUrl.port === '80') {
      newUrl.port = ''
    }
  }

  return newUrl
}

const areSameURL = (urlA, urlB,
  stripCommonPrefixes = true, stripParams = true, stripScheme = true) => {
  try {
    const processedUrlA = processUrl(urlA, stripCommonPrefixes, stripParams,
      stripScheme)
    const processedUrlB = processUrl(urlB, stripCommonPrefixes, stripParams,
      stripScheme)

    return processedUrlA.toString() === processedUrlB.toString()
  } catch (e) {
    console.error('areSameURL: ')
    console.error(`urlA: ${urlA}, urlB ${urlB}`)
    console.error(e)
    return false
  }
}

const makeComparisonFunction = (stripCommonPrefixes = true,
  stripParams = true, stripScheme = true) => {
  return (urlA, urlB) => {
    return areSameURL(urlA, urlB, stripCommonPrefixes, stripParams, stripScheme)
  }
}

module.exports = {
  areSameURL,
  makeComparisonFunction
}
