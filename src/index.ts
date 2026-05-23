import type { Env, Topic } from "./types";
import { fetchRecentItems } from "./services/rss";
import { rankAndSummarize } from "./services/ai";
import { notifySlack } from "./services/slack";
import { saveSummary, getPendingSummaries, markNotified } from "./services/db";
import topicsJson from "../topics.json";

const topics = topicsJson as Topic[];

/** RSS取得 → AI要約 → D1保存 */
async function runFetch(env: Env): Promise<void> {
  for (const topic of topics) {
    try {
      const seen = new Set<string>();
      const feedResults = await Promise.all(topic.feeds.map(fetchRecentItems));
      const allItems = feedResults
        .flat()
        .filter((item) => {
          if (seen.has(item.link)) return false;
          seen.add(item.link);
          return true;
        });

      const perFeed = topic.feeds.map((url, i) => `${url}:${feedResults[i].length}件`).join(", ");
      console.log(`[${topic.name}] フィード別取得数: ${perFeed}`);

      if (allItems.length === 0) {
        console.log(`[${topic.name}] 新しいアイテムなし、スキップ`);
        continue;
      }

      console.log(`[${topic.name}] 重複除去後 ${allItems.length}件を AI に送信`);
      const summary = await rankAndSummarize(env, topic.name, allItems);
      if (summary) {
        await saveSummary(env, topic.name, summary);
        console.log(`[${topic.name}] D1 に保存完了`);
      } else {
        console.warn(`[${topic.name}] AI からの応答が空のためスキップ`);
      }
    } catch (e) {
      console.error(`[${topic.name}] 取得エラー:`, e);
    }
  }
}

/** D1未送信レコード → Slack通知 */
async function runNotify(env: Env): Promise<void> {
  const records = await getPendingSummaries(env);
  console.log(`未送信レコード: ${records.length}件`);

  for (const record of records) {
    try {
      const ok = await notifySlack(env, record.topic_name, record.summary);
      if (ok) {
        await markNotified(env, record.id);
        console.log(`[${record.topic_name}] Slack 送信完了 (id=${record.id})`);
      }
    } catch (e) {
      console.error(`[${record.topic_name}] Slack 送信エラー (id=${record.id}):`, e);
    }
  }
}

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    if (event.cron === "15 23 * * *") {
      await runFetch(env);
    } else if (event.cron === "30 23 * * *") {
      await runNotify(env);
    } else {
      console.warn(`未知の cron トリガー: ${event.cron}`);
    }
  },
};
