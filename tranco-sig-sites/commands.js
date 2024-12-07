const scrapeLib = require('./scrape')
const trancoLib = require('./tranco')

const isPageSignificant = async (minContentSize, timeoutSecs, browser, url) => {
  const rs = await scrapeLib.getPageContentForURL(
    browser, url, timeoutSecs)
  if (!rs) {
    return false
  }

  const pageContent = rs.content
  if (pageContent.length < minContentSize) {
    return false
  }

  return rs
}

const __pageInfoForURL = async (browser, url, contentSize,
  maxChildPages, timeoutSecs, strict, headless, urlComparisonFunc) => {
  const isSigFunc = isPageSignificant.bind(undefined,
    contentSize, timeoutSecs, browser)

  const siteResult = {
    landing: {
      requestedUrl: null,
      finalUrl: null,
      size: null
    },
    children: [],
    hostname: url.hostname
  }

  await scrapeLib.closeAllPages(browser)
  const rs = await isSigFunc(url)
  if (rs === false) {
    return null
  }
  const landingPage = rs.page
  siteResult.landing.requestedUrl = url
  siteResult.landing.finalUrl = rs.url
  siteResult.landing.size = rs.content.length

  const ignoreURLs = new Set([
    new URL(siteResult.landing.requestedUrl),
    new URL(siteResult.landing.finalUrl)
  ])
  const childURLs = await scrapeLib.getSameSiteLinkedURLs(
    landingPage, ignoreURLs, urlComparisonFunc)
  for (const aChildUrl of childURLs.values()) {
    if (siteResult.children.length >= maxChildPages) {
      break
    }
    const childRs = await isSigFunc(aChildUrl)
    if (!childRs) {
      continue
    }

    siteResult.children.push({
      requestedUrl: aChildUrl,
      finalUrl: childRs.url,
      size: childRs.content.length
    })
  }

  if (strict === true && siteResult.children.length !== maxChildPages) {
    return null
  }

  return siteResult
}

const pageInfoForURL = async (url, contentSize, maxChildPages,
  timeoutSecs, strict, headless, urlComparisonFunc, outputFile) => {
  const browser = await scrapeLib.launchBrowser(headless)
  const siteResult = await __pageInfoForURL(browser, url, contentSize,
    maxChildPages, timeoutSecs, strict, headless, urlComparisonFunc)
  if (siteResult === null) {
    return false
  }

  await outputFile.write(JSON.stringify(siteResult) + '\n')
  return true
}

const httpSchemes = [
  'https://',
  'http://'
]

const pageInfoForTrancoFile = async (filepath, contentSize,
  limit, maxChildPages, timeoutSecs, strict, headless, urlComparisonFunc,
  outputFile) => {
  const trancoRecords = await trancoLib.recordsFromFile(filepath)
  const browser = await scrapeLib.launchBrowser(headless)

  let numResults = 0
  for (const [rank, site] of trancoRecords) {
    if (numResults >= limit) {
      break
    }

    for (const aHTTPScheme of httpSchemes) {
      const possibleRootURL = new URL(aHTTPScheme + site)
      const siteResult = await __pageInfoForURL(browser, possibleRootURL,
        contentSize, maxChildPages, timeoutSecs, strict, headless,
        urlComparisonFunc)
      if (siteResult === null) {
        continue
      }
      siteResult.rank = rank
      await outputFile.write(JSON.stringify(siteResult) + '\n')
      numResults += 1
      break
    }
  }

  await browser.close()
  return numResults
}

module.exports = {
  pageInfoForTrancoFile,
  pageInfoForURL
}
