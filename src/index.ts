import type { Env, Topic } from "./types";
import { fetchRecentItems } from "./services/rss";
import { rankAndSummarize } from "./services/ai";
import { notifySlack } from "./services/slack";
import topicsJson from "../topics.json";

const topics = topicsJson as Topic[];

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    for (const topic of topics) {
      const allItems = (
        await Promise.all(topic.feeds.map(fetchRecentItems))
      ).flat();

      if (allItems.length === 0) {
        console.log(`[${topic.name}] 新しいアイテムなし`);
        continue;
      }

      console.log(`[${topic.name}] ${allItems.length}件を AI に送信`);
      const summary = await rankAndSummarize(env, topic.name, allItems);

      if (summary) {
        await notifySlack(env, topic.name, summary);
      }
    }
  },
};
