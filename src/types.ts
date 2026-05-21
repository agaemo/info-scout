export interface FeedItem {
  title: string;
  link: string;
  pubDate: Date;
}

export interface Topic {
  name: string;
  feeds: string[];
}

export interface Env {
  SLACK_WEBHOOK_URL: string;
  AI: Ai;
}
