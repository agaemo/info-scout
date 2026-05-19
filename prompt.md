# info-scout 実行プロンプト

## 手順

1. `~/development/info-scout/topics.json` を読み込む
2. 各トピックの `queries` を WebSearch で検索し、過去24時間以内の新しい情報を収集する
3. 重複・古い情報は除外し、全クエリの結果を横断して重要度でランキングする
4. 上位10件程度を「1位・2位・3位…」の形式で並べる。会社ごとにまとめず、重要度順に並べること
5. 各項目は「順位・タイトル（日本語）・情報源 URL・1〜2行の概要」の形式にする
6. `~/development/info-scout/.env` から `SLACK_WEBHOOK_URL` を読み込む
7. 以下の形式で Slack に curl 送信する

## Slack 送信

```bash
source ~/development/info-scout/.env
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '<JSONペイロード>'
```

ペイロード形式：
```json
{
  "text": "info-scout レポート",
  "attachments": [
    {
      "title": "<トピック名>",
      "text": "<収集した情報の要約（箇条書き）>",
      "color": "#36a64f"
    }
  ]
}
```

## 注意

- 情報がないトピックはスキップする
- `SLACK_WEBHOOK_URL` が未設定の場合は標準出力に結果を表示して終了する
