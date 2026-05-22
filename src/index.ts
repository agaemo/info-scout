import type { Env, Topic } from "./types";
import { fetchRecentItems } from "./services/rss";
import { rankAndSummarize } from "./services/ai";
import { notifySlack } from "./services/slack";
import topicsJson from "../topics.json";

const topics = topicsJson as Topic[];

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    for (const topic of topics) {
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
        await notifySlack(env, topic.name, summary);
      }
    }
  },
};
