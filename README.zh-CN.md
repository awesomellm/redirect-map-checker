# 重定向映射检查器

检查网站改版前的 URL 迁移计划，发现循环、链式跳转、重复来源和目标冲突。

[在线使用](https://zequnweb.com/tools/redirect-map-checker/) · [English](README.md)

## 本地运行

需要 Node.js 20 或更新版本，无需安装第三方依赖。

```sh
node check.mjs example-valid.tsv https://example.com
node --test redirect-map.test.mjs
```

输入为无表头的两列 TSV：旧 URL、目标 URL，每行一条。以 `/` 开头的路径按原站域名解析；跨域迁移使用完整 URL。最多接受 2,000 个非空行。

CLI 输出 JSON。退出码 0 表示没有发现问题，1 表示需要人工检查，2 表示输入或文件错误。

## 功能边界

仅分析输入计划中的精确 URL 关系，不请求网址，不验证 301/308 状态、目标内容、索引或通配符规则。大小写、查询参数和尾斜线仍有区别。检查通过后，还要在实际服务器上验证。

配套资料：[网站迁移模板](https://github.com/awesomellm/website-migration-kit)。

由 [ZequnWeb](https://zequnweb.com/zh/) 维护，使用 [MIT 许可证](LICENSE)。
