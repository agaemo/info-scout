import type { Env } from "../types";

/** トピックの要約を Slack に送信する */
export async function notifySlack(
  env: Env,
  topicName: string,
  summary: string
): Promise<boolean> {
  if (!env.SLACK_WEBHOOK_URL) {
    console.log("SLACK_WEBHOOK_URL 未設定のためスキップ");
    return true;
  }

  const payload = {
    text: `*${topicName}* — 本日のトップニュース`,
    attachments: [{ text: summary, color: "#36a64f", mrkdwn_in: ["text"] }],
  };

  const res = await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Slack 送信失敗:", res.status, await res.text());
    return false;
  }
  return true;
}
