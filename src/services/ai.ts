import type { FeedItem, Env } from "../types";

/**
 * Workers AI でニュースを重要度順にランキング・要約する。
 * トークン削減のため AI に渡すのはタイトルと URL のみ。
 */
export async function rankAndSummarize(
  env: Env,
  topicName: string,
  items: FeedItem[]
): Promise<string> {
  if (items.length === 0) return "";

  const list = items
    .slice(0, 15)
    .map((item, i) => `${i + 1}. ${item.title} (${item.link})`)
    .join("\n");

  const prompt = `あなたはITニュースのキュレーターです。以下のニュース一覧から重要度の高い順に上位5件を選び、各項目を以下の形式で出力してください。余計な説明は不要です。

形式（各項目の間に必ず空行を入れること）:
*タイトル日本語訳*
<URL|元記事>
1文の要約

ニュース:
${list}`;

  try {
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      prompt,
      max_tokens: 512,
    });
    return (response as { response: string }).response.trim();
  } catch (e) {
    console.error(`[AI] ${topicName} の要約失敗:`, e);
    return "";
  }
}
