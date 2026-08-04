import { env } from "cloudflare:workers";
import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { filings, members, transactions } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticker = url.searchParams.get("ticker")?.trim().toUpperCase();
    const chamber = url.searchParams.get("chamber");
    const action = url.searchParams.get("action");
    const since = url.searchParams.get("since");
    const search = url.searchParams.get("q")?.trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 100, 1), 500);

    const filters = [
      ticker ? eq(transactions.ticker, ticker) : undefined,
      chamber === "House" || chamber === "Senate" ? eq(members.chamber, chamber) : undefined,
      action === "Purchase" || action === "Sale" || action === "Exchange" ? eq(transactions.action, action) : undefined,
      since ? gte(transactions.transactionDate, since) : undefined,
      search ? or(
        like(members.fullName, `%${search}%`),
        like(transactions.assetName, `%${search}%`),
        like(transactions.ticker, `%${search.toUpperCase()}%`),
      ) : undefined,
    ].filter(Boolean);

    const db = getDb();
    const rows = await db
      .select({
        id: transactions.id,
        member: members.fullName,
        party: members.party,
        chamber: members.chamber,
        state: members.state,
        ticker: transactions.ticker,
        company: transactions.assetName,
        action: transactions.action,
        owner: transactions.owner,
        amount: transactions.amountLabel,
        amountLow: transactions.amountLow,
        amountHigh: transactions.amountHigh,
        traded: transactions.transactionDate,
        filed: filings.filedAt,
        sourceUrl: filings.sourceUrl,
        sourceDocumentId: filings.sourceDocumentId,
        confidence: filings.parserConfidence,
        amended: sql<boolean>`${filings.amendmentOfId} is not null`,
      })
      .from(transactions)
      .innerJoin(filings, eq(transactions.filingId, filings.id))
      .innerJoin(members, eq(filings.memberId, members.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(filings.filedAt), desc(transactions.transactionDate))
      .limit(limit);

    return Response.json({ mode: "live", generatedAt: new Date().toISOString(), trades: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Disclosure database unavailable";
    return Response.json({ mode: "unavailable", trades: [], error: message }, { status: 503 });
  }
}

type IngestPayload = {
  member: { bioguideId: string; fullName: string; chamber: "House" | "Senate"; party: "D" | "R" | "I"; state: string; district?: string };
  filing: { source: "house" | "senate"; sourceDocumentId: string; reportType: string; filedAt: string; sourceUrl: string; documentSha256: string; parserVersion: string; parserConfidence: number; amendmentOfSourceDocumentId?: string };
  transactions: Array<{ stableKey: string; owner: string; assetName: string; ticker?: string; assetType: string; action: "Purchase" | "Sale" | "Exchange"; transactionDate: string; amountLow?: number; amountHigh?: number; amountLabel: string; partialSale?: boolean; tickerConfidence?: number; notes?: string }>;
};

export async function POST(request: Request) {
  const ingestToken = (env as unknown as { INGEST_TOKEN?: string }).INGEST_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!ingestToken || supplied !== ingestToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = await request.json() as IngestPayload;
    if (!payload.member?.bioguideId || !payload.filing?.sourceDocumentId || !payload.filing?.sourceUrl || !payload.filing?.documentSha256 || !payload.transactions?.length) {
      return Response.json({ error: "Incomplete normalized filing" }, { status: 400 });
    }

    const db = getDb();
    await db.insert(members).values(payload.member).onConflictDoUpdate({
      target: members.bioguideId,
      set: { fullName: payload.member.fullName, chamber: payload.member.chamber, party: payload.member.party, state: payload.member.state, district: payload.member.district, updatedAt: new Date().toISOString() },
    });
    const [member] = await db.select({ id: members.id }).from(members).where(eq(members.bioguideId, payload.member.bioguideId)).limit(1);

    let amendmentOfId: number | undefined;
    if (payload.filing.amendmentOfSourceDocumentId) {
      const [parent] = await db.select({ id: filings.id }).from(filings).where(and(eq(filings.source, payload.filing.source), eq(filings.sourceDocumentId, payload.filing.amendmentOfSourceDocumentId))).limit(1);
      amendmentOfId = parent?.id;
    }

    await db.insert(filings).values({ ...payload.filing, memberId: member.id, amendmentOfId }).onConflictDoUpdate({
      target: [filings.source, filings.sourceDocumentId],
      set: { filedAt: payload.filing.filedAt, sourceUrl: payload.filing.sourceUrl, documentSha256: payload.filing.documentSha256, parserVersion: payload.filing.parserVersion, parserConfidence: payload.filing.parserConfidence, amendmentOfId },
    });
    const [filing] = await db.select({ id: filings.id }).from(filings).where(and(eq(filings.source, payload.filing.source), eq(filings.sourceDocumentId, payload.filing.sourceDocumentId))).limit(1);

    for (const transaction of payload.transactions) {
      await db.insert(transactions).values({ ...transaction, filingId: filing.id }).onConflictDoUpdate({
        target: [transactions.filingId, transactions.stableKey],
        set: { ...transaction, filingId: filing.id },
      });
    }
    return Response.json({ ok: true, filingId: filing.id, transactionCount: payload.transactions.length }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ingestion failed" }, { status: 500 });
  }
}
