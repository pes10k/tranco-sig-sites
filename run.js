#!/usr/bin/env node

const { version } = require('./package.json')

const argParseLib = require('argparse')

const commandsLib = require('./tranco-sig-sites/commands')
const localUrlLib = require('./tranco-sig-sites/urls')

const parser = new argParseLib.ArgumentParser({
  description: 'Extract useful, significant sites from the Tranco list.',
  formatter_class: argParseLib.ArgumentDefaultsHelpFormatter
})
parser.add_argument('--version', {
  action: 'version',
  version
})
parser.add_argument('file', {
  help: 'path to Tranco list of domains, encoded as a CSV file. This is ' +
        'required, unless using --url, in which case this must not be ' +
        'provided.',
  type: argParseLib.FileType('r'),
  nargs: '?'
})
parser.add_argument('--url', {
  help: 'apply significance checks, and extract significant child pages ' +
        'for just the given URL, instead of from the Tranco list. ' +
        'This argument is mutually exclusive with providing a path to a ' +
        'Tranco encoded CSV file (e.g., the [file] positional argument).',
  type: URL
})
parser.add_argument('-b', '--bytes', {
  help: 'how large (in bytes) the page\'s content must be to be considered ' +
        '"significant" and returned in the results.',
  type: 'int',
  default: 1000
})
parser.add_argument('-n', '--num', {
  help: 'maximum number of sites to consider (i.e., maximum number of ' +
        'results to return). This is ignored if using --url.',
  type: 'int',
  default: 100
})
parser.add_argument('-p', '--num-pages', {
  help: 'maximum number of same-site pages to find per site.',
  type: 'int',
  default: 1
})
parser.add_argument('-t', '--timeout', {
  help: 'maximum amount of time, in seconds, to wait when trying to load ' +
  'a page.',
  type: 'int',
  default: 10
})
parser.add_argument('-s', '--strict', {
  help: 'if provided, only return a site in the result set if ' +
        '`--num-sub-pages` child pages with significant content were found ' +
        'on the site.',
  action: 'store_true'
})
parser.add_argument('-v', '--visible', {
  help: 'if provided, conduct crawl using a visible browser instance (the ' +
        'opposite of "headless" mode).',
  action: 'store_true'
})
parser.add_argument('-o', '--output', {
  help: 'path to write results to (otherwise, writes to STDIO).',
  type: argParseLib.FileType('w')
})
parser.add_argument('--strip-query-params', {
  help: 'strip query params when comparing whether two URLs are the same.',
  action: argParseLib.BooleanOptionalAction,
  default: true
})
parser.add_argument('--strip-common-subdomain-prefixes', {
  help: 'strip common subdomains (e.g., "www.") when comparing whether two URLs are the same.',
  action: argParseLib.BooleanOptionalAction,
  default: true
})
parser.add_argument('--strip-url-schemes', {
  help: 'strip URL schemes when comparing whether two URLs are the same.',
  action: argParseLib.BooleanOptionalAction,
  default: true
})

const args = parser.parse_args()
if (args.file === undefined && args.url === undefined) {
  parser.error('either [file] or --url must be provided')
}
if (args.file !== undefined && args.url !== undefined) {
  parser.error('cannot use [file] and --url at the same time')
}

const outputFile = args.output || process.stdout
const urlComparisonFunc = localUrlLib.makeComparisonFunction(
  args.strip_common_subdomain_prefixes, args.strip_query_params,
  args.strip_url_schemes
)

;(async () => {
  let isSuccess = false
  if (args.file) {
    const numResults = await commandsLib.pageInfoForTrancoFile(
      args.file, args.bytes, args.num, args.num_pages, args.timeout,
      args.strict, !args.visible, urlComparisonFunc, outputFile)
    isSuccess = numResults >= args.num
  } else {
    isSuccess = await commandsLib.pageInfoForURL(args.url, args.bytes,
      args.num_pages, args.timeout, args.strict, !args.visible,
      urlComparisonFunc, outputFile)
  }
  process.exit(isSuccess ? 0 : 1)
})()
