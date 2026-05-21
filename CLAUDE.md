# info-scout 開発ガイド

## 概要

Cloudflare Workers で動作する汎用情報収集ツール。
RSS フィードを収集し Workers AI で要約・ランキングして Slack に通知する。

## 技術スタック

- Runtime: Cloudflare Workers
- 言語: TypeScript
- パッケージマネージャ: pnpm
- ツール管理: mise

## 開発フロー

- 変更は必ず Issue を作成してから着手する
- 実装は feature ブランチで行い、PR を作成してマージする
- `main` への直接コミットは禁止

## ローカル開発

```bash
mise install
pnpm install
cp .env.example .dev.vars  # SLACK_WEBHOOK_URL を設定
pnpm dev
```

## デプロイ

```bash
pnpm deploy
```

## トピックの追加

`topics.json` の `feeds` 配列に RSS URL を追加するだけ。
