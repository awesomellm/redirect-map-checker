# Deploy and verify exact-path redirects

[English](DEPLOYMENT.md) | [简体中文](DEPLOYMENT.zh-CN.md) | [日本語](DEPLOYMENT.ja.md) | [繁體中文](DEPLOYMENT.zh-HK.md)

This recipe implements `/old-contact.html` → `https://example.com/contact/`. It assumes a GET page and an unchanged query string. Adapt the domain and path to an approved inventory. The local checker does not read hosting configuration or make network requests.

## Cloudflare Single Redirect

Create a redirect rule for the exact hostname and path. Use this custom filter expression:

```text
(http.host eq "example.com" and http.request.uri.path eq "/old-contact.html")
```

Choose a static destination `https://example.com/contact/`, status `301`, and enable query-string preservation for this example. Hostname normalization is a separate rule; avoid sending an already canonical hostname back to itself. The edge rule needs traffic routed through Cloudflare. Confirm its order relative to broader rules.

## Nginx

Place the following exact location inside the appropriate HTTPS server block. Test the complete server configuration with `nginx -t` before reloading it.

```nginx
location = /old-contact.html {
    return 301 https://example.com/contact/$is_args$args;
}
```

`$is_args$args` appends the original query when present. Removing it deliberately discards the query. This is a location snippet, not a full server or TLS configuration.

## Apache HTTP Server

Use an anchored `RedirectMatch` with `mod_alias` enabled in the appropriate virtual host or permitted directory configuration:

```apache
RedirectMatch 301 "^/old-contact\.html$" "https://example.com/contact/"
```

The anchors prevent unintended suffix matching. With no replacement query supplied, this example retains the original query. Test the complete configuration with `apachectl -t`; directory override permissions and overlapping rewrite rules can change behavior.

## GET acceptance checks

```sh
curl -sS -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
curl -sS -L --max-redirs 5 -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
```

Expect the initial 301 and the intended destination including the query. Verify the final response and visible content. Also test the same path without a query, an unrelated path and the final page itself. Confirm no loop and no unnecessary intermediate redirect. A source that is merely similar to the old path must not be caught by this exact rule.

## Failure cases to review

- A source with two destinations needs one approved outcome before deployment.
- A → B → C should normally point A directly to the approved C; preserve a legitimate intermediate step only when there is a documented reason.
- A → B → A is a loop and must be corrected.
- POST forms and APIs need an explicit method-preservation decision; this page recipe is not an API migration policy.
- A removed page without an equivalent is not an excuse to redirect unrelated content to the homepage.

[Cloudflare settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/) · [Nginx return directive](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return) · [Apache RedirectMatch](https://httpd.apache.org/docs/2.4/mod/mod_alias.html#redirectmatch)

[Migration workflow](https://github.com/awesomellm/website-migration-kit/blob/main/MIGRATION.md) · [ZequnWeb](https://zequnweb.com/)
