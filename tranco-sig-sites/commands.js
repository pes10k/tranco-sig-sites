const scrapeLib = require('./scrape')
const trancoLib = require('./tranco')
const urlsLib = require('./urls')

const isPageSignificant = async (minContentSize, timeoutSecs, browser, url) => {
  const rs = await scrapeLib.getPageContentForUrl(
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

const getTrancoUrlsWithSignificantContent = async (filepath, contentSize,
  limit, maxChildPages, timeoutSecs, strict, headless, stripQueryParams,
  outputFile) => {
  const trancoResults = await trancoLib.recordsFromFile(filepath)
  const processUrl = urlsLib.process.bind(undefined, stripQueryParams)

  // Simple closure so that we don't actually launch the browser until
  // we've started parsing the tranco result, so that we can more quickly
  // quit
  const browser = await scrapeLib.launchBrowser(headless)
  const isSigFunc = isPageSignificant.bind(undefined, contentSize, timeoutSecs,
    browser)

  let numResults = 0
  const possibleSchemes = [
    'https://',
    'http://'
  ]

  for (const [rank, site] of trancoResults) {
    if (numResults >= limit) {
      break
    }

    const siteResult = {
      landing: {
        requestedUrl: null,
        finalUrl: null,
        size: null
      },
      children: [],
      rank,
      site
    }

    let landingPage = null

    for (const possibleScheme of possibleSchemes) {
      const possibleLandingUrl = possibleScheme + site
      const rs = await isSigFunc(possibleLandingUrl)
      if (rs === false) {
        continue
      }
      landingPage = rs.page
      siteResult.landing.requestedUrl = possibleLandingUrl
      siteResult.landing.finalUrlRaw = rs.url
      siteResult.landing.finalUrl = processUrl(rs.url)

      siteResult.landing.size = rs.content.length
      break
    }

    if (landingPage === null) {
      await scrapeLib.closeAllPages(browser)
      continue
    }

    const urlsToIgnore = new Set([
      siteResult.landing.requestedUrl,
      siteResult.landing.requestedUrl + '/',
      siteResult.landing.finalUrlRaw,
      siteResult.landing.finalUrl
    ])

    const allChildUrls = await scrapeLib.getSameSitePageUrls(
      landingPage, urlsToIgnore, stripQueryParams)
    for (const aChildUrl of allChildUrls.values()) {
      if (siteResult.children.length >= maxChildPages) {
        break
      }
      await scrapeLib.closeAllPages(browser)
      const childRs = await isSigFunc(aChildUrl)
      if (!childRs) {
        continue
      }

      siteResult.children.push({
        requestedUrl: aChildUrl,
        finalUrlRaw: childRs.url,
        finalUrl: processUrl(childRs.url),
        size: childRs.content.length
      })
    }

    if (strict === true && siteResult.children.length !== maxChildPages) {
      continue
    }

    await outputFile.write(JSON.stringify(siteResult) + '\n')
    numResults += 1
  }

  return numResults
}

module.exports = {
  getTrancoUrlsWithSignificantContent
}
