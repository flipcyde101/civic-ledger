declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    INGEST_TOKEN?: string;
  };
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

type D1Database = any;
