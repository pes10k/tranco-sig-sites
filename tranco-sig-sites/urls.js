const process = (stripQueryParams, urlString) => {
  const url = new URL(urlString)
  const processedUrlParts = [
    url.origin,
    url.pathname
  ]

  if (stripQueryParams === false) {
    processedUrlParts.push(url.search)
  }
  return processedUrlParts.join('')
}

module.exports = {
  process
}
