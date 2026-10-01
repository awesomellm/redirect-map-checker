# Redirect Map Checker

Review a URL migration plan before a website redesign goes live. This dependency-free JavaScript module flags exact-match loops, chains, duplicate sources, and conflicting destinations.

[Try the browser demo](https://zequnweb.com/tools/redirect-map-checker/) · [中文说明](README.zh-CN.md)

## Run locally

Use Node.js 20 or newer. No package installation is required.

```sh
git clone https://github.com/awesomellm/redirect-map-checker.git
cd redirect-map-checker
node check.mjs example-valid.tsv https://example.com
node --test redirect-map.test.mjs
```

The CLI prints a JSON report. Exit codes: `0` = no flagged issues, `1` = review required, `2` = input or file error. A clean plan is not proof that production redirects work.

## Input format

Use two **tab-separated** columns: old URL, then new URL. Remove the header and use one mapping per line. Paths starting with `/` resolve against the supplied origin. For a domain move, use full HTTP(S) URLs. The limit is 2,000 non-empty rows.

| File | Demonstrates |
| --- | --- |
| [example-valid.tsv](example-valid.tsv) | Direct, distinct destinations |
| [example-loop.tsv](example-loop.tsv) | A cycle including its upstream entry point |
| [example-chain.tsv](example-chain.tsv) | An unnecessary intermediate hop |
| [example-conflict.tsv](example-conflict.tsv) | One source assigned two destinations |

## JavaScript API

```js
import { checkRedirectMap } from './redirect-map.mjs';

const map = '/old-contact.html\t/contact/';
const report = checkRedirectMap(map, 'https://example.com');
console.log(report);
```

Each row contains `line`, `from`, `to`, and an `issues` array. Invalid rows also contain `invalid: true`. Invalid origins, empty maps, and oversized maps throw an error.

## Checks

- Loops, self redirects, and redirect chains
- Duplicate mappings and conflicting destinations
- Paths that reach a conflicting mapping
- External destinations for manual review
- HTTPS-to-HTTP downgrades and unsupported input

## Scope and limitations

The module analyzes the supplied URL relationships locally. It does not fetch URLs, verify HTTP status codes, check destination content or indexing, or interpret wildcard rules. Case, query strings, and trailing slashes remain significant.

Validate the deployed server rules separately, including permanent redirect status, relevant destination content, canonicals, internal links, and indexing settings.

## Website migration workflow

Inventory useful old URLs, decide what stays or moves, assign relevant replacements, check the map, implement redirects, and verify production responses.

- [Website Migration Kit](https://github.com/awesomellm/website-migration-kit): reusable planning and acceptance templates.
- [ZequnWeb website redesign checklist](https://zequnweb.com/blog/website-redesign-checklist/): content, migration, and launch workflow.
