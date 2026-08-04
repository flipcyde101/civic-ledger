import { env } from "cloudflare:workers";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { priceSnapshots, statementAssetLinks, statements } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticker = url.searchParams.get("ticker")?.trim().toUpperCase();
    if (!ticker) return Response.json({ error: "ticker is required" }, { status: 400 });
    const db = getDb();
    const [prices, linkedStatements] = await Promise.all([
      db.select().from(priceSnapshots).where(eq(priceSnapshots.ticker, ticker)).orderBy(desc(priceSnapshots.priceDate)).limit(90),
      db.select({
        id: statements.id, speakerName: statements.speakerName, leadershipRole: statements.leadershipRole,
        title: statements.title, excerpt: statements.excerpt, publishedAt: statements.publishedAt,
        sourceType: statements.sourceType, sourceUrl: statements.sourceUrl,
        relevanceScore: statementAssetLinks.relevanceScore, matchMethod: statementAssetLinks.matchMethod,
        evidence: statementAssetLinks.evidence, reviewed: statementAssetLinks.reviewed,
      }).from(statementAssetLinks).innerJoin(statements, eq(statementAssetLinks.statementId, statements.id))
        .where(and(eq(statementAssetLinks.ticker, ticker), gte(statementAssetLinks.relevanceScore, 0.5)))
        .orderBy(desc(statements.publishedAt)).limit(25),
    ]);
    return Response.json({ ticker, prices, statements: linkedStatements });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Context unavailable", prices: [], statements: [] }, { status: 503 });
  }
}

type ContextPayload = {
  price?: { ticker: string; priceDate: string; close: number; currency?: string; source: string; sourceUrl: string };
  statement?: { speakerName: string; leadershipRole?: string; title: string; excerpt: string; publishedAt: string; sourceType: string; sourceUrl: string; documentSha256: string; links: Array<{ ticker: string; companyName: string; relevanceScore: number; matchMethod: string; evidence: string; reviewed?: boolean }> };
};

export async function POST(request: Request) {
  const ingestToken = (env as unknown as { INGEST_TOKEN?: string }).INGEST_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!ingestToken || supplied !== ingestToken) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const payload = await request.json() as ContextPayload;
    const db = getDb();
    if (payload.price) {
      await db.insert(priceSnapshots).values({ ...payload.price, ticker: payload.price.ticker.toUpperCase() }).onConflictDoUpdate({
        target: [priceSnapshots.ticker, priceSnapshots.priceDate, priceSnapshots.source],
        set: { close: payload.price.close, currency: payload.price.currency ?? "USD", sourceUrl: payload.price.sourceUrl, retrievedAt: new Date().toISOString() },
      });
    }
    if (payload.statement) {
      const { links, ...statement } = payload.statement;
      if (!statement.speakerName?.trim() || !statement.title?.trim() || !statement.excerpt?.trim() || !statement.publishedAt || !statement.sourceType?.trim() || !statement.sourceUrl?.startsWith("https://") || !statement.documentSha256?.trim() || !Array.isArray(links) || links.length === 0) {
        return Response.json({ error: "Incomplete statement or missing asset links" }, { status: 400 });
      }
      if (links.some((link) => !link.ticker?.trim() || !link.companyName?.trim() || !link.matchMethod?.trim() || !link.evidence?.trim() || link.relevanceScore < 0 || link.relevanceScore > 1)) {
        return Response.json({ error: "Invalid statement asset link" }, { status: 400 });
      }
      await db.insert(statements).values(statement).onConflictDoUpdate({ target: statements.sourceUrl, set: statement });
      const [saved] = await db.select({ id: statements.id }).from(statements).where(eq(statements.sourceUrl, statement.sourceUrl)).limit(1);
      for (const link of links) await db.insert(statementAssetLinks).values({ ...link, ticker: link.ticker.toUpperCase(), statementId: saved.id }).onConflictDoUpdate({
        target: [statementAssetLinks.statementId, statementAssetLinks.ticker], set: link,
      });
    }
    if (!payload.price && !payload.statement) return Response.json({ error: "price or statement is required" }, { status: 400 });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Context ingestion failed" }, { status: 500 });
  }
}
