# リダイレクトマッピングチェッカー

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [繁體中文](README.zh-HK.md)

ウェブサイトのリニューアルを公開する前に、URL の移行計画を確認するツールです。外部ライブラリに依存しない JavaScript モジュールで、URL の完全一致による対応関係から、ループ、チェーン、転送元の重複、転送先の競合を検出します。

## ローカルで実行する

Node.js 20 以降が必要です。追加のパッケージをインストールする必要はありません。

```sh
git clone https://github.com/awesomellm/redirect-map-checker.git
cd redirect-map-checker
node check.mjs example-valid.tsv https://example.com
node --test redirect-map.test.mjs
```

コマンドラインツールは JSON 形式のレポートを出力します。終了コードは、`0` が問題の検出なし、`1` が確認を要する問題あり、`2` が入力またはファイルのエラーです。検査に通っても、本番環境のリダイレクトが正しく動作することを保証するものではありません。

## 入力形式

旧 URL、新 URL の順に、**タブで区切った 2 列**を使用します。見出し行を削除し、1 行に 1 件の対応関係を記入してください。`/` で始まるパスは、指定した移行元サイトのオリジンを基準に解決します。ドメインを変更する場合は、完全な HTTP(S) URL を使用してください。空行を除いて最大 2,000 行まで対応します。

| ファイル | 確認できる例 |
| --- | --- |
| [example-valid.tsv](example-valid.tsv) | それぞれ異なる転送先への直接リダイレクト |
| [example-loop.tsv](example-loop.tsv) | ループと、そのループに入る上流の URL |
| [example-chain.tsv](example-chain.tsv) | 不要な中間リダイレクト |
| [example-conflict.tsv](example-conflict.tsv) | 1 つの転送元に 2 つの転送先を指定した状態 |

## JavaScript API

```js
import { checkRedirectMap } from './redirect-map.mjs';

const map = '/old-contact.html\t/contact/';
const report = checkRedirectMap(map, 'https://example.com');
console.log(report);
```

各行の結果には `line`、`from`、`to`、`issues` 配列が含まれます。無効な行には `invalid: true` も含まれます。移行元のオリジンが無効な場合、入力が空の場合、行数の上限を超えた場合は、エラーが発生します。

## 検査項目

- ループ、同じ URL へのリダイレクト、リダイレクトチェーン
- 対応関係の重複と転送先の競合
- 競合する対応関係に到達する経路
- 手動確認が必要な外部サイトへの転送
- HTTPS から HTTP への変更と、未対応の入力

## 対応範囲と制限

入力された URL の関係だけをローカルで解析します。URL へのアクセス、HTTP ステータスコードの確認、転送先の内容やインデックス登録の確認、ワイルドカードルールの解釈は行いません。大文字と小文字、クエリパラメーター、末尾のスラッシュは区別されます。

公開後のサーバー設定は別途検証してください。恒久的なリダイレクトのステータスコード、転送先の内容との関連性、正規 URL、内部リンク、インデックス登録の設定を確認する必要があります。

## ウェブサイト移行の流れ

有用な旧 URL を一覧化し、維持するページと移行するページを決め、関連する転送先を選びます。対応表を検査してリダイレクトを設定した後、本番環境の応答を確認してください。

- [ウェブサイト移行テンプレート](https://github.com/awesomellm/website-migration-kit/blob/main/README.ja.md)：計画と公開時の確認に使えるテンプレートです。
- [ZequnWeb のリニューアルチェックリスト](https://zequnweb.com/jp/blog/homepage-renewal-checklist/)：コンテンツ、移行、公開の手順をまとめています。

## メンテナンスとライセンス

[ZequnWeb](https://zequnweb.com/jp/) が管理しています。MIT ライセンス（`LICENSE`）で公開しています。
