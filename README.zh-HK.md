# 重新導向對照檢查器

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [繁體中文](README.zh-HK.md)

在網站重設上線前檢查 URL 遷移計劃。這個無需第三方依賴的 JavaScript 模組，可以找出精確 URL 對照關係中的循環、連鎖跳轉、重複來源和目標衝突。

[線上使用](https://zequnweb.com/tools/redirect-map-checker/)（網頁介面為英文）。

## 在本機執行

需要 Node.js 20 或更新版本，無需安裝第三方套件。

```sh
git clone https://github.com/awesomellm/redirect-map-checker.git
cd redirect-map-checker
node check.mjs example-valid.tsv https://example.com
node --test redirect-map.test.mjs
```

命令列工具會輸出 JSON 報告。結束代碼：`0` 表示沒有發現問題，`1` 表示需要人工檢查，`2` 表示輸入或檔案錯誤。檢查通過不代表正式環境中的重新導向已正常運作。

## 輸入格式

使用兩欄**以定位字元分隔**的內容，依次填寫舊 URL 和新 URL。刪除標題列，每列只保留一條對照。以 `/` 開頭的路徑會按提供的原站網域解析；跨網域遷移應使用完整的 HTTP(S) URL。最多接受 2,000 個非空列。

| 檔案 | 範例內容 |
| --- | --- |
| [example-valid.tsv](example-valid.tsv) | 直接跳轉至各自不同的目標 |
| [example-loop.tsv](example-loop.tsv) | 循環跳轉及其上游入口 |
| [example-chain.tsv](example-chain.tsv) | 不必要的中間跳轉 |
| [example-conflict.tsv](example-conflict.tsv) | 同一來源對應兩個目標 |

## JavaScript 介面

```js
import { checkRedirectMap } from './redirect-map.mjs';

const map = '/old-contact.html\t/contact/';
const report = checkRedirectMap(map, 'https://example.com');
console.log(report);
```

每條結果包含 `line`、`from`、`to` 和 `issues` 陣列。無效列還包含 `invalid: true`。原站位址無效、對照內容為空或超過列數限制時，模組會拋出錯誤。

## 檢查項目

- 循環跳轉、自身跳轉和連鎖跳轉
- 重複對照和目標衝突
- 最終進入衝突對照的路徑
- 需要人工確認的外部目標
- 從 HTTPS 降級至 HTTP，以及不支援的輸入

## 功能範圍與限制

模組只在本機分析輸入的 URL 關係，不存取網址，不驗證 HTTP 狀態碼、目標內容或索引情況，也不解讀萬用字元規則。大小寫、查詢參數和結尾斜線仍有區別。

部署後還需要另外驗證伺服器規則，包括永久重新導向狀態碼、目標內容的相關性、標準網址設定、內部連結和索引設定。

## 網站遷移流程

整理有價值的舊 URL，決定保留或遷移的頁面，選擇相關的新目標，檢查對照表，設定重新導向，再驗證正式環境的回應。

- [網站遷移範本](https://github.com/awesomellm/website-migration-kit/blob/main/README.zh-HK.md)：可重複使用的規劃和驗收範本。
- [ZequnWeb 網站重設檢查清單](https://zequnweb.com/blog/website-redesign-checklist/)（英文）：內容、遷移和上線流程。

## 維護者與授權

由 [ZequnWeb](https://zequnweb.com/zh-hk/) 維護，採用 [MIT 授權條款](LICENSE)。
