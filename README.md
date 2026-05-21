# info-scout

指定した RSS フィードを毎日収集し、Workers AI で要約・ランキングして Slack に通知する汎用情報収集ツール。
Cloudflare Workers で動作する。外部 AI API 不要・完全無料。

## 仕組み

1. `topics.json` にトピックと RSS フィード URL を記載する
2. Cron trigger が毎日 9:30 JST（UTC 0:30）に起動
3. 各フィードを取得し、過去24時間以内のアイテムを抽出
4. Workers AI（Llama 3.1）で重要度順にランキング・日本語要約
5. Slack Webhook でトピックごとに送信

## セットアップ

### 1. 依存関係のインストール

```bash
mise install
pnpm install
```

### 2. Cloudflare にデプロイ

```bash
pnpm deploy
```

### 3. 環境変数を設定

Cloudflare ダッシュボード → Workers & Pages → info-scout → Settings → Variables に追加：

| 変数名 | 値 |
|---|---|
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |

## トピックの追加・変更

`topics.json` を編集して PR を出すだけで次回実行から反映される。

```json
[
  {
    "name": "トピック名",
    "feeds": [
      "https://example.com/feed.xml"
    ]
  }
]
```

## 開発

```bash
pnpm dev       # ローカル開発サーバー
pnpm typecheck # 型チェック
```

## 注意

- `SLACK_WEBHOOK_URL` はリポジトリにコミットしないこと（`.dev.vars` に記載）
