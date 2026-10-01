# 部署并验证精确路径重定向

[English](DEPLOYMENT.md) | [简体中文](DEPLOYMENT.zh-CN.md) | [日本語](DEPLOYMENT.ja.md) | [繁體中文](DEPLOYMENT.zh-HK.md)

本例实现 `/old-contact.html` → `https://example.com/contact/`，针对 GET 页面并保留查询参数。请按已确认的清单替换域名与路径。本地检查器不会读取托管配置，也不会请求网址。

## Cloudflare 单一重定向

为精确主机名及路径建立规则，使用以下自定义过滤表达式：

```text
(http.host eq "example.com" and http.request.uri.path eq "/old-contact.html")
```

选择静态目标 `https://example.com/contact/`、状态 `301`，并为本例启用保留查询字符串。主机名规范化应另设规则，避免已经规范的域名转回自身。边缘规则需要流量经过 Cloudflare，并核对它与更宽泛规则的先后顺序。

## Nginx

把精确路径配置放入对应 HTTPS 服务器块。重新加载前用 `nginx -t` 检查完整配置。

```nginx
location = /old-contact.html {
    return 301 https://example.com/contact/$is_args$args;
}
```

`$is_args$args` 会在存在查询参数时附加原参数。明确移除它才会丢弃查询字符串。这是路径片段，不是完整服务器或 TLS 配置。

## Apache HTTP Server

在合适的虚拟主机或允许的目录配置中，启用 `mod_alias` 并使用带起止锚点的 `RedirectMatch`：

```apache
RedirectMatch 301 "^/old-contact\.html$" "https://example.com/contact/"
```

起止锚点避免意外匹配多余后缀。本例没有指定替换查询字符串，会保留原参数。用 `apachectl -t` 检查完整配置；目录覆盖权限和其他重写规则可能影响最终行为。

## GET 验收检查

```sh
curl -sS -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
curl -sS -L --max-redirs 5 -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
```

核对初始 301 及含预期参数的目标，检查最终响应与可见内容。另测不带参数的旧路径、不相关路径及目标页面本身，确认没有循环和多余中间跳转。仅仅与旧地址相似的路径不应被这条精确规则捕获。

## 需要处理的错误

- 同一来源对应两个目标，部署前必须确认唯一去向。
- A → B → C 通常应改为 A 直接指向已确认的 C；保留中间步骤须有明确理由。
- A → B → A 是循环，需要修正。
- POST 表单和 API 需要单独决定是否保留请求方法，本页不是 API 迁移方案。
- 没有等价替代的停用页面，不应统一转到无关首页。

[网站迁移流程](https://github.com/awesomellm/website-migration-kit/blob/main/MIGRATION.zh-CN.md) · [ZequnWeb 中文网站](https://zequnweb.com/zh/)
