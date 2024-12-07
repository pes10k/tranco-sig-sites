const puppeteerLib = require('puppeteer-extra')
const stealthPluginLib = require('puppeteer-extra-plugin-stealth')
const tldtsLib = require('tldts')

const __closePage = async (page) => {
  try {
    await page.close()
  } catch (e) {
    console.error('__closePage:')
    console.error(e)
  }
}

const launchBrowser = async (headless = true) => {
  puppeteerLib.use(stealthPluginLib())
  return puppeteerLib.launch({
    headless
  })
}

const closeAllPages = async (browser) => {
  for (const page of await browser.pages()) {
    await page.close(false)
  }
}

const getPageContentForURL = async (browser, url, timeoutSecs) => {
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(timeoutSecs * 1000)

  let rs
  try {
    rs = await page.goto(url)
  } catch (e) {
    console.error(`getPageContentForURL: url: ${url}`)
    console.error(`${e.name}: ${e.message}`)
    return null
  }
  if (!rs || rs.ok() === false) {
    return false
  }

  try {
    const summary = {
      content: await rs.content(),
      page,
      url: rs.url()
    }
    return summary
  } catch (e) {
    console.error(`getPageContentForURL: url: ${url}`)
    console.error(`${e.name}: ${e.message}`)
    return null
  }
}

const isURLinSet = (urlComparisonFunc, aSet, needleURL) => {
  for (const aURL of aSet) {
    if (urlComparisonFunc(aURL, needleURL)) {
      return true
    }
  }
  return false
}

const getSameSiteLinkedURLs = async (page, ignoreURLsSet, urlComparisonFunc) => {
  const shouldIgnoreURL = isURLinSet.bind(undefined, urlComparisonFunc)

  const pageURL = new URL(page.url())
  const pageSite = tldtsLib.parse(pageURL.hostname).domain

  const sameSiteURLs = new Set()
  const anchorTags = await page.$$('a[href]')
  for (const anchorTag of anchorTags) {
    try {
      const hrefHandle = await anchorTag.getProperty('href')
      const hrefValue = await hrefHandle.jsonValue()
      const anchorURL = new URL(hrefValue, pageURL)
      const anchorSite = tldtsLib.parse(anchorURL.hostname).domain

      if (shouldIgnoreURL(ignoreURLsSet, anchorURL)) {
        continue
      }
      if (shouldIgnoreURL(sameSiteURLs, anchorURL)) {
        continue
      }
      if (anchorSite !== pageSite) {
        continue
      }
      sameSiteURLs.add(anchorURL)
    } catch (e) {
      console.error(`getSameSiteLinkedURLs: url ${pageURL}`)
      console.error(e)
    }
  }

  return sameSiteURLs
}

module.exports = {
  closeAllPages,
  launchBrowser,
  getPageContentForURL,
  getSameSiteLinkedURLs
}
