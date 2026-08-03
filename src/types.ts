export interface Env {
  PAGES: KVNamespace;
  // Everything below is optional so local dev, tests, and minimal
  // self-hosted deployments work with just the PAGES KV namespace.
  ANALYTICS?: AnalyticsEngineDataset;
  PUBLISH_LIMITER?: RateLimit;
  PUBLISH_GLOBAL_LIMITER?: RateLimit;
  ASSETS_BUCKET?: R2Bucket;
}

export interface PageData {
  html: string;
  title: string;
  description: string;
  markdownPreview?: string;
}

export interface TemplateOptions {
  title?: string;
  description?: string;
  pageUrl?: string;
  origin?: string;
  ogImageUrl?: string;
  ogType?: string;
}
