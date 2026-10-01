# 部署並驗證精確路徑轉址

[English](DEPLOYMENT.md) | [简体中文](DEPLOYMENT.zh-CN.md) | [日本語](DEPLOYMENT.ja.md) | [繁體中文](DEPLOYMENT.zh-HK.md)

本例實作 `/old-contact.html` → `https://example.com/contact/`，針對 GET 頁面並保留查詢參數。請按已確認清單替換網域及路徑。本機檢查器不會讀取託管設定，也不會請求網址。

## Cloudflare 單一轉址

為精確主機名稱及路徑建立規則，使用以下自訂篩選運算式：

```text
(http.host eq "example.com" and http.request.uri.path eq "/old-contact.html")
```

選擇靜態目標 `https://example.com/contact/`、狀態 `301`，並為本例啟用保留查詢字串。主機名稱標準化應另設規則，避免已標準化的網域轉回自身。邊緣規則需要流量經過 Cloudflare，並須核對它與廣泛規則的先後次序。

## Nginx

將精確路徑設定放入對應的 HTTPS 伺服器區塊。重新載入前用 `nginx -t` 檢查完整設定。

```nginx
location = /old-contact.html {
    return 301 https://example.com/contact/$is_args$args;
}
```

`$is_args$args` 會在存在查詢參數時附加原參數。明確移除它才會捨棄查詢字串。這是路徑片段，不是完整伺服器或 TLS 設定。

## Apache HTTP Server

在合適的虛擬主機或允許的目錄設定中，啟用 `mod_alias` 並使用帶起止錨點的 `RedirectMatch`：

```apache
RedirectMatch 301 "^/old-contact\.html$" "https://example.com/contact/"
```

起止錨點避免意外匹配額外後綴。本例沒有指定替換查詢字串，會保留原參數。用 `apachectl -t` 檢查完整設定；目錄覆寫權限及其他重寫規則可能影響最終行為。

## GET 驗收檢查

```sh
curl -sS -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
curl -sS -L --max-redirs 5 -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
```

核對初始 301 及包含預期參數的目標，檢查最終回應與可見內容。另測不帶參數的舊路徑、不相關路徑及目標頁面本身，確認沒有循環與多餘中間轉址。僅與舊地址相似的路徑不應被這條精確規則捕獲。

## 須處理的錯誤

- 同一來源對應兩個目標，部署前必須確認唯一去向。
- A → B → C 通常應改為 A 直接指向已確認的 C；保留中間步驟須有明確理由。
- A → B → A 是循環，須修正。
- POST 表格與 API 須另外決定是否保留請求方法，本頁不是 API 遷移方案。
- 沒有等價替代的停用頁面，不應一律轉往無關首頁。

[網站遷移流程](https://github.com/awesomellm/website-migration-kit/blob/main/MIGRATION.zh-HK.md) · [ZequnWeb 繁體中文網站](https://zequnweb.com/zh-hk/)
