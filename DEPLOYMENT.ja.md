# 完全一致のパス転送を設定して検証する

[English](DEPLOYMENT.md) | [简体中文](DEPLOYMENT.zh-CN.md) | [日本語](DEPLOYMENT.ja.md) | [繁體中文](DEPLOYMENT.zh-HK.md)

`/old-contact.html` → `https://example.com/contact/` を設定する例です。GET ページを対象にクエリを保持します。承認した一覧に合わせてドメインとパスを変更してください。ローカルツールは配信設定を読まず、URL への通信も行いません。

## Cloudflare の単一リダイレクト

ホスト名とパスを完全一致させるルールを作り、次のカスタム条件を使います。

```text
(http.host eq "example.com" and http.request.uri.path eq "/old-contact.html")
```

固定の転送先を `https://example.com/contact/`、ステータスを `301` にし、この例ではクエリの保持を有効にします。ホスト名の正規化は別のルールにし、正規ホストを自分自身へ転送しないようにします。通信が Cloudflare を経由することと、広い条件との評価順を確認します。

## Nginx

対象の HTTPS サーバーブロックに完全一致の設定を置きます。再読み込み前に `nginx -t` で全体を検査します。

```nginx
location = /old-contact.html {
    return 301 https://example.com/contact/$is_args$args;
}
```

`$is_args$args` はクエリがある場合に元の値を付加します。意図的に削除するとクエリを捨てます。これはパス用の断片であり、サーバーや TLS の全設定ではありません。

## Apache HTTP Server

適切な仮想ホストまたは許可されたディレクトリ設定で `mod_alias` を有効にし、先頭と末尾を指定した `RedirectMatch` を使います。

```apache
RedirectMatch 301 "^/old-contact\.html$" "https://example.com/contact/"
```

両端の指定により余分な接尾辞を拾いません。この例は置換先クエリを指定せず、元のクエリを保持します。`apachectl -t` で全体を検査してください。ディレクトリの許可や別の書き換えルールも実際の動作に影響します。

## GET 応答による検収

```sh
curl -sS -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
curl -sS -L --max-redirs 5 -D - -o /dev/null 'https://example.com/old-contact.html?utm_source=test'
```

初回の 301 と、予定したクエリを含む転送先を確認し、最後の応答と画面内容を検査します。クエリなしの旧パス、無関係なパス、転送先自身も試します。循環や不要な中間転送がないことを確認します。旧パスに似ているだけの URL はこのルールに一致すべきではありません。

## 対処する失敗例

- 同じ転送元に二つの転送先がある場合、公開前に一つを承認します。
- A → B → C は通常 A から承認した C へ直接向けます。中間段階を残すなら理由を記録します。
- A → B → A は循環なので修正します。
- POST フォームと API はメソッド保持の判断が別途必要です。このページは API 移行方針ではありません。
- 同等の代替がない廃止ページを無関係なホームへ一律転送しません。

[サイト移行の手順](https://github.com/awesomellm/website-migration-kit/blob/main/MIGRATION.ja.md) · [ZequnWeb 日本語サイト](https://zequnweb.com/jp/)
