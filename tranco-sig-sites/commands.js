const scrapeLib = require('./scrape')
const trancoLib = require('./tranco')

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
  limit, maxChildPages, timeoutSecs, strict, headless, outputFile) => {
  const browser = await scrapeLib.launchBrowser(headless)
  const isSigFunc = isPageSignificant.bind(undefined, contentSize, timeoutSecs,
    browser)
  const trancoResults = await trancoLib.recordsFromFile(filepath)

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
      siteResult.landing.finalUrl = rs.url
      siteResult.landing.size = rs.content.length
      break
    }

    if (landingPage === null) {
      await scrapeLib.closeAllPages(browser)
      continue
    }

    const urlsToIgnore = new Set([
      siteResult.landing,
      siteResult.landing + '/',
      siteResult.landing.finalUrl])
    const allChildUrls = await scrapeLib.getSameSitePageUrls(
      landingPage, urlsToIgnore)
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
        finalUrl: childRs.url,
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
