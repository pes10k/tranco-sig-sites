usage: run.js [-h] [--version] [--url URL] [-b BYTES] [-n NUM] [-p NUM_PAGES]
              [-t TIMEOUT] [-s] [-v] [-o OUTPUT]
              [--strip-query-params | --no-strip-query-params]
              [--strip-common-subdomain-prefixes | --no-strip-common-subdomain-prefixes]
              [--strip-url-schemes | --no-strip-url-schemes]
              [file]

Extract useful, significant sites from the Tranco list.

positional arguments:
  file                  path to Tranco list of domains, encoded as a CSV file.
                        This is required, unless using --url, in which case
                        this must not be provided. (default: undefined)

optional arguments:
  -h, --help            show this help message and exit
  --version             show program's version number and exit
  --url URL             apply significance checks, and extract significant
                        child pages for just the given URL, instead of from
                        the Tranco list. This argument is mutually exclusive
                        with providing a path to a Tranco encoded CSV file
                        (e.g., the [file] positional argument). (default:
                        undefined)
  -b BYTES, --bytes BYTES
                        how large (in bytes) the page's content must be to be
                        considered "significant" and returned in the results.
                        (default: 1000)
  -n NUM, --num NUM     maximum number of sites to consider (i.e., maximum
                        number of results to return). This is ignored if using
                        --url. (default: 100)
  -p NUM_PAGES, --num-pages NUM_PAGES
                        maximum number of same-site pages to find per site.
                        (default: 1)
  -t TIMEOUT, --timeout TIMEOUT
                        maximum amount of time, in seconds, to wait when
                        trying to load a page. (default: 10)
  -s, --strict          if provided, only return a site in the result set if
                        `--num-sub-pages` child pages with significant content
                        were found on the site. (default: false)
  -v, --visible         if provided, conduct crawl using a visible browser
                        instance (the opposite of "headless" mode). (default:
                        false)
  -o OUTPUT, --output OUTPUT
                        path to write results to (otherwise, writes to STDIO).
                        (default: undefined)
  --strip-query-params, --no-strip-query-params
                        strip query params when comparing whether two URLs are
                        the same. (default: true)
  --strip-common-subdomain-prefixes, --no-strip-common-subdomain-prefixes
                        strip common subdomains (e.g., "www.") when comparing
                        whether two URLs are the same. (default: true)
  --strip-url-schemes, --no-strip-url-schemes
                        strip URL schemes when comparing whether two URLs are
                        the same. (default: true)
