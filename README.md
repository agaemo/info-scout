# info-scout

指定したトピックを毎日 Web 検索・収集し、Slack に通知する汎用情報収集エージェント。
Claude Code CLI と macOS の crontab で動作する。外部 AI API 不要。

## 仕組み

1. `topics.json` に監視したいトピックとクエリを記載する
2. crontab が毎日 9:30 に `run.sh` を起動
3. Claude Code CLI が各クエリを WebSearch で検索・収集し、重要度順にランキングでまとめる
4. Slack Incoming Webhook 経由で指定チャンネルに送信する

## セットアップ

### 1. Slack Webhook URL を取得

1. https://api.slack.com/apps を開き「Create New App」→「From scratch」
2. 左メニュー「Incoming Webhooks」を ON にする
3. 「Add New Webhook to Workspace」→ 送信先チャンネルを選択
4. 表示された Webhook URL をコピーする

### 2. リポジトリのセットアップ

```bash
git clone git@agaemo-GitHub:agaemo/info-scout.git
cd info-scout

cp .env.example .env
# .env を開いて SLACK_WEBHOOK_URL に取得した URL を設定
```

### 3. 動作確認

```bash
./run.sh
```

### 4. crontab に登録（毎日 9:30 に自動実行）

```bash
# run.sh の絶対パスを確認する
realpath run.sh

crontab -e
```

以下を追記する（パスは `realpath run.sh` の出力に合わせる）：

```
30 9 * * * /absolute/path/to/info-scout/run.sh
```

crontab は PATH が限られるため、`claude` が見つからない場合は `which claude` で取得したフルパスを `run.sh` 内の `claude` コマンドに指定する。

## トピックの追加・変更

`topics.json` を編集して `git push` するだけで次回実行から反映される。

```json
[
  {
    "name": "トピック名",
    "queries": [
      "検索クエリ1",
      "検索クエリ2"
    ]
  }
]
```

## 出力形式

全トピックを横断して重要度順にランキング表示（上位10件）。
各項目に情報源 URL・日本語概要を付記する。

## 注意

- `.env` の `SLACK_WEBHOOK_URL` はリポジトリにコミットしないこと
- Mac がスリープ中でも crontab は動作する
