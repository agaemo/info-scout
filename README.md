# info-scout

指定したトピックを毎日 Web 検索・収集し、Slack に通知する汎用情報収集エージェント。
Claude Code CLI と macOS の launchd で動作する。外部 AI API 不要。

## 仕組み

1. `topics.json` に監視したいトピックとクエリを記載する
2. launchd が毎日 9:30 に `run.sh` を起動（スリープ中でも復帰後に実行）
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

### 4. launchd に登録（毎日 9:30 に自動実行）

```bash
chmod +x setup.sh
./setup.sh
```

スリープ復帰後に自動実行される。ログは `~/Library/Logs/info-scout.log` に出力される。

### 5. launchd の解除

```bash
launchctl unload ~/Library/LaunchAgents/com.info-scout.daily.plist
```

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
- `claude` コマンドが見つからない場合は `which claude` でフルパスを確認し、`run.sh` に指定する
