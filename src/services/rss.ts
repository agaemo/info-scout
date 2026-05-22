import { XMLParser } from "fast-xml-parser";
import type { FeedItem } from "../types";

// entityExpansionLimit は型定義にないが有効なランタイムオプション（デフォルト1000では大規模フィードで超過する）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = new XMLParser(
  { ignoreAttributes: false, processEntities: false, entityExpansionLimit: 10000 } as any
);

/** Atom の <link href="..."> 属性、または RSS の文字列リンクを解決する */
function resolveLink(raw: unknown, id: unknown): string {
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    // Atom: { "@_href": "...", "@_rel": "alternate" }
    return String(obj["@_href"] ?? "").trim();
  }
  return String(raw ?? id ?? "").trim();
}

/** RSS / Atom フィードを取得し、過去24時間以内のアイテムを返す */
export async function fetchRecentItems(feedUrl: string): Promise<FeedItem[]> {
  let res: Response;
  try {
    res = await fetch(feedUrl, {
      headers: { "User-Agent": "info-scout/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.warn(`RSS fetch error: ${feedUrl}`, e);
    return [];
  }

  if (!res.ok) {
    console.warn(`RSS fetch failed: ${feedUrl} (${res.status})`);
    return [];
  }

  const xml = await res.text();
  let parsed: ReturnType<typeof parser.parse>;
  try {
    parsed = parser.parse(xml);
  } catch (e) {
    console.warn(`XML parse error: ${feedUrl}`, e);
    return [];
  }

  const rawItems: unknown[] =
    parsed?.rss?.channel?.item ??
    parsed?.feed?.entry ??
    [];

  const since = Date.now() - 24 * 60 * 60 * 1000;

  const items = (Array.isArray(rawItems) ? rawItems : [rawItems])
    .map((item) => {
      const i = item as Record<string, unknown>;
      const title = String(i["title"] ?? "").trim();
      const link = resolveLink(i["link"], i["id"]);
      const dateStr = String(i["pubDate"] ?? i["published"] ?? i["updated"] ?? "");
      const pubDate = new Date(dateStr);
      return { title, link, pubDate };
    })
    .filter((i) => i.title && i.link && i.pubDate.getTime() > since);

  console.log(`[RSS] ${feedUrl} → ${items.length}件`);
  return items;
}
