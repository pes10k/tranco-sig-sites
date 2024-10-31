#!/usr/bin/env node

const argParseLib = require('argparse')

const commandsLib = require('./tranco-sig-sites/commands')

const parser = new argParseLib.ArgumentParser({
  description: 'Extract useful, significant sites from the Tranco list.'
})
parser.add_argument('file', {
  help: 'Path to Tracno list, encoded as a CSV file, on disk'
})
parser.add_argument('-b', '--bytes', {
  help: 'How large (in bytes) the page\'s content must be to be considered ' +
        '"significant" and returned in the results.',
  type: 'int',
  default: 1000
})
parser.add_argument('-n', '--num', {
  help: 'Maximum number of sites to consider (i.e., maximum number of ' +
        'results to return).',
  type: 'int',
  default: 100
})
parser.add_argument('-p', '--num-pages', {
  help: 'Maximum number of same-site pages to find per site.',
  type: 'int',
  default: 1
})
parser.add_argument('-t', '--timeout', {
  help: 'Maximum amount of time, in seconds, to wait when trying to load ' +
  'a page.',
  type: 'int',
  default: 10
})
parser.add_argument('-s', '--strict', {
  help: 'If provided, only return a site in the result set if ' +
        '`--num-sub-pages` child pages with significant content were found ' +
        'on the site.',
  action: 'store_true'
})
parser.add_argument('-v', '--visible', {
  help: 'If provided, conduct crawl using a visible browser instance (the ' +
        'opposite of "headless" mode).',
  action: 'store_true'
})
parser.add_argument('-o', '--output', {
  help: 'Path to write results to (otherwise, writes to STDIO).',
  type: argParseLib.FileType('w'),
  default: process.stdout
})

const args = parser.parse_args();

(async () => {
  const numResults = await commandsLib.getTrancoUrlsWithSignificantContent(
    args.file, args.bytes, args.num, args.num_pages, args.timeout, args.strict,
    !args.visible, args.output
  )
  const isSuccess = numResults >= args.num
  process.exit(isSuccess ? 0 : 1)
})()
