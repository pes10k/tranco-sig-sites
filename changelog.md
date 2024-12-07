1.0.2
---
Add additional options for controlling if two URLs are treated as the same
(i.e., --strip-url-schemes, --strip-common-subdomain-prefixes).

Add option for testing a single URL (i.e., --url).

Change CSV parsing to use streams interface.


1.0.1
---

Additional validation on input tranco list before doing any crawling.

Delay launching the browser until the above validation has been completed
(to avoid booting up chrome just to have to close it right away).

Add `--strip-query-params` / `--no-strip-query-params` option, to remove
query parameters from all URLs extracted from pages.

Fix minor issue in `argparse` dependency where default argument descriptions
would be duplicated in the help.


1.0.0
---

Initial release.
