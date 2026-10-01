# 重定向映射检查器

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [繁體中文](README.zh-HK.md)

在网站改版上线前检查 URL 迁移计划。这个无需第三方依赖的 JavaScript 模块可以发现精确 URL 映射中的循环、链式跳转、重复来源和目标冲突。

## 本地运行

需要 Node.js 20 或更新版本，无需安装第三方依赖。

```sh
git clone https://github.com/awesomellm/redirect-map-checker.git
cd redirect-map-checker
node check.mjs example-valid.tsv https://example.com
node --test redirect-map.test.mjs
```

命令行工具输出 JSON 报告。退出码：`0` 表示没有发现问题，`1` 表示需要人工检查，`2` 表示输入或文件错误。检查通过不代表生产环境中的重定向已经正常工作。

## 输入格式

使用两列**以制表符分隔**的内容，依次填写旧 URL 和新 URL。删除表头，每行只保留一条映射。以 `/` 开头的路径会按提供的原站域名解析；跨域迁移应使用完整的 HTTP(S) URL。最多接受 2,000 个非空行。

| 文件 | 示例内容 |
| --- | --- |
| [example-valid.tsv](example-valid.tsv) | 直接跳转到各自不同的目标 |
| [example-loop.tsv](example-loop.tsv) | 循环跳转及其上游入口 |
| [example-chain.tsv](example-chain.tsv) | 不必要的中间跳转 |
| [example-conflict.tsv](example-conflict.tsv) | 同一来源对应两个目标 |

## JavaScript 接口

```js
import { checkRedirectMap } from './redirect-map.mjs';

const map = '/old-contact.html\t/contact/';
const report = checkRedirectMap(map, 'https://example.com');
console.log(report);
```

每条结果包含 `line`、`from`、`to` 和 `issues` 数组。无效行还包含 `invalid: true`。原站地址无效、映射为空或超过行数限制时，模块会抛出错误。

## 检查项目

- 循环跳转、自身跳转和链式跳转
- 重复映射和目标冲突
- 最终进入冲突映射的路径
- 需要人工确认的外部目标
- 从 HTTPS 降级到 HTTP，以及不支持的输入

## 功能边界

模块仅在本地分析输入的 URL 关系，不请求网址，不验证 HTTP 状态码、目标内容或索引情况，也不解释通配符规则。大小写、查询参数和尾斜线仍有区别。

部署后还需要单独验证服务器规则，包括永久重定向状态码、目标内容的相关性、规范网址设置、内部链接和索引设置。

## 网站迁移流程

整理有价值的旧 URL，决定保留或迁移的页面，选择相关的新目标，检查映射，配置重定向，再验证生产环境的响应。

- [网站迁移模板](https://github.com/awesomellm/website-migration-kit/blob/main/README.zh-CN.md)：可重复使用的规划和验收模板。
- [ZequnWeb 网站改版检查清单](https://zequnweb.com/zh/blog/website-redesign-checklist/)：内容、迁移和上线流程。

## 维护者与许可

由 [ZequnWeb](https://zequnweb.com/zh/) 维护，使用 MIT 许可证（`LICENSE`）。
