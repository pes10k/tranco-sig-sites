usage: run.js [-h] [-b BYTES] [-n NUM] [-p NUM_PAGES] [-t TIMEOUT] [-s] [-v]
              [-o OUTPUT]
              file

Extract useful, significant sites from the Tranco list.

positional arguments:
  file                  Path to Tranco list, encoded as a CSV file.

optional arguments:
  -h, --help            show this help message and exit
  -b BYTES, --bytes BYTES
                        How large (in bytes) the page's content must be to be
                        considered "significant" and returned in the results.
                        (default: 1000)
  -n NUM, --num NUM     Maximum number of sites to consider (i.e., maximum
                        number of results to return). (default: 100)
  -p NUM_PAGES, --num-pages NUM_PAGES
                        Maximum number of same-site pages to find per site.
                        (default: 1)
  -t TIMEOUT, --timeout TIMEOUT
                        Maximum amount of time, in seconds, to wait when
                        trying to load a page. (default: 10)
  -s, --strict          If provided, only return a site in the result set if
                        `--num-sub-pages` child pages with significant content
                        were found on the site. (default: false)
  -v, --visible         If provided, conduct crawl using a visible browser
                        instance (the opposite of "headless" mode). (default:
                        false)
  -o OUTPUT, --output OUTPUT
                        Path to write results to (otherwise, writes to STDIO).
                        (default: [object Object])
