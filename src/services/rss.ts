import { XMLParser } from "fast-xml-parser";
import type { FeedItem } from "../types";

const parser = new XMLParser({ ignoreAttributes: false });

/** RSS / Atom フィードを取得し、過去24時間以内のアイテムを返す */
export async function fetchRecentItems(feedUrl: string): Promise<FeedItem[]> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "info-scout/1.0" },
  });
  if (!res.ok) {
    console.warn(`RSS fetch failed: ${feedUrl} (${res.status})`);
    return [];
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);

  const rawItems: unknown[] =
    parsed?.rss?.channel?.item ??
    parsed?.feed?.entry ??
    [];

  const since = Date.now() - 24 * 60 * 60 * 1000;

  return (Array.isArray(rawItems) ? rawItems : [rawItems])
    .map((item) => {
      const i = item as Record<string, unknown>;
      const title = String(i["title"] ?? "").trim();
      const link = String(i["link"] ?? i["id"] ?? "").trim();
      const dateStr = String(i["pubDate"] ?? i["published"] ?? i["updated"] ?? "");
      const pubDate = new Date(dateStr);
      return { title, link, pubDate };
    })
    .filter((i) => i.title && i.link && i.pubDate.getTime() > since);
}
