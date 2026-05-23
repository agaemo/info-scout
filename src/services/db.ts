import type { Env } from "../types";

export interface SummaryRecord {
  id: number;
  topic_name: string;
  summary: string;
  created_at: number;
  notified_at: number | null;
}

export async function saveSummary(env: Env, topicName: string, summary: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO summaries (topic_name, summary, created_at) VALUES (?, ?, ?)"
  )
    .bind(topicName, summary, Date.now())
    .run();
}

export async function getPendingSummaries(env: Env): Promise<SummaryRecord[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM summaries WHERE notified_at IS NULL ORDER BY created_at ASC"
  ).all<SummaryRecord>();
  return result.results;
}

export async function markNotified(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE summaries SET notified_at = ? WHERE id = ?")
    .bind(Date.now(), id)
    .run();
}
