# info-scout 実行プロンプト

## 手順

1. `./topics.json` を読み込む
2. `./.env` から `SLACK_WEBHOOK_URL` を読み込む
3. topics.json の各トピックについて、以下をループ処理する：
   a. トピックの `queries` を WebSearch で検索し、過去24時間以内の新しい情報を収集する
   b. 重複・古い情報を除外し、重要度順に上位10件をランキングする
   c. 各項目は「順位・タイトル（日本語）・情報源 URL・1〜2行の概要」の形式にする
   d. Slack に curl で送信する（トピックごとに1メッセージ）

## Slack 送信形式

トピックごとに以下の形式で送信する：

```bash
source ./.env
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '<JSONペイロード>'
```

ペイロード形式：
```json
{
  "text": "<トピック名> レポート",
  "attachments": [
    {
      "text": "1. <タイトル>\n<URL>\n<概要>\n\n2. <タイトル>\n...",
      "color": "#36a64f"
    }
  ]
}
```

## 注意

- 情報が見つからないトピックはスキップする
- `SLACK_WEBHOOK_URL` が未設定の場合は標準出力に結果を表示して終了する
