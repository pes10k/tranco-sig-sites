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

const getPageContentForUrl = async (browser, url, timeoutSecs) => {
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(timeoutSecs * 1000)

  let rs
  try {
    rs = await page.goto(url)
  } catch (e) {
    console.error('getPageContentForUrl')
    console.error(e)
    await __closePage(page)
    return null
  }
  if (!rs || rs.ok() === false) {
    await __closePage(page)
    return false
  }

  const summary = {
    content: await rs.content(),
    page,
    url: rs.url()
  }
  return summary
}

const getSameSitePageUrls = async (page, urlsToIgnore) => {
  let pageSite
  let pageUrl
  const pageUrlStr = page.url()
  try {
    pageUrl = new URL(pageUrlStr)
    pageSite = tldtsLib.parse(pageUrl.hostname).domain
  } catch (e) {
    console.error('getSameSitePageUrls')
    console.error(e)
    return null
  }

  const sameSiteLinkedUrls = new Set()
  const anchorTags = await page.$$('a[href]')
  for (const anchorTag of anchorTags) {
    try {
      const hrefHandle = await anchorTag.getProperty('href')
      const hrefValue = await hrefHandle.jsonValue()
      const anchorUrl = new URL(hrefValue, pageUrl)
      const anchorSite = tldtsLib.parse(anchorUrl.hostname).domain

      if (urlsToIgnore.has(hrefValue)) {
        continue
      }
      if (hrefValue === pageUrlStr) {
        continue
      }
      if (anchorSite !== pageSite) {
        continue
      }
      sameSiteLinkedUrls.add(hrefValue)
    } catch (e) {
      console.error('getSameSitePageUrls')
      console.error(e)
    }
  }

  return sameSiteLinkedUrls
}

module.exports = {
  closeAllPages,
  launchBrowser,
  getPageContentForUrl,
  getSameSitePageUrls
}
