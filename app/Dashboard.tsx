"use client";

import { useEffect, useState } from "react";

type Trade = {
  id: number;
  member: string;
  initials: string;
  party: "D" | "R";
  chamber: "House" | "Senate";
  state: string;
  ticker: string;
  company: string;
  action: "Purchase" | "Sale";
  owner: string;
  amount: string;
  traded: string;
  filed: string;
  delay: number;
  signal: number;
  committee: string;
  sourceUrl?: string;
  confidence?: number;
};

const trades: Trade[] = [
  { id: 1, member: "Rep. Avery Morgan", initials: "AM", party: "D", chamber: "House", state: "CA", ticker: "NVDA", company: "NVIDIA Corp.", action: "Purchase", owner: "Spouse", amount: "$50K–$100K", traded: "2026-07-08", filed: "2026-07-29", delay: 21, signal: 92, committee: "Science & Technology" },
  { id: 2, member: "Sen. Thomas Reed", initials: "TR", party: "R", chamber: "Senate", state: "TX", ticker: "RTX", company: "RTX Corporation", action: "Purchase", owner: "Joint", amount: "$15K–$50K", traded: "2026-07-02", filed: "2026-07-30", delay: 28, signal: 88, committee: "Armed Services" },
  { id: 3, member: "Rep. Elena Park", initials: "EP", party: "D", chamber: "House", state: "NY", ticker: "MSFT", company: "Microsoft Corp.", action: "Sale", owner: "Self", amount: "$100K–$250K", traded: "2026-06-18", filed: "2026-07-30", delay: 42, signal: 81, committee: "Financial Services" },
  { id: 4, member: "Rep. Marcus Hill", initials: "MH", party: "R", chamber: "House", state: "FL", ticker: "LMT", company: "Lockheed Martin", action: "Purchase", owner: "Spouse", amount: "$15K–$50K", traded: "2026-07-21", filed: "2026-07-31", delay: 10, signal: 79, committee: "Appropriations" },
  { id: 5, member: "Sen. Claire Bennett", initials: "CB", party: "D", chamber: "Senate", state: "WA", ticker: "AMZN", company: "Amazon.com, Inc.", action: "Sale", owner: "Joint", amount: "$50K–$100K", traded: "2026-07-12", filed: "2026-07-31", delay: 19, signal: 74, committee: "Commerce" },
  { id: 6, member: "Rep. Daniel Foster", initials: "DF", party: "R", chamber: "House", state: "OH", ticker: "JPM", company: "JPMorgan Chase", action: "Purchase", owner: "Self", amount: "$1K–$15K", traded: "2026-06-20", filed: "2026-08-01", delay: 42, signal: 66, committee: "Ways & Means" },
];

const spark = [18, 22, 19, 31, 28, 36, 32, 45, 41, 51, 48, 57, 61, 58, 72, 68, 79, 75, 84, 92];
const demoPrices = [119, 121, 120, 124, 128, 127, 131, 134, 132, 137, 139, 143];

type MarketContext = {
  prices: Array<{ priceDate: string; close: number; source: string; sourceUrl: string }>;
  statements: Array<{ id: number; speakerName: string; leadershipRole?: string; title: string; excerpt: string; publishedAt: string; sourceType: string; sourceUrl: string; relevanceScore: number; evidence: string; reviewed: boolean }>;
};

export default function Dashboard() {
  const [records, setRecords] = useState<Trade[]>(trades);
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [query, setQuery] = useState("");
  const [chamber, setChamber] = useState("All Congress");
  const [activeTab, setActiveTab] = useState("Activity");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchOnly, setWatchOnly] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState("All");
  const [dateRange, setDateRange] = useState("90");
  const [visibleCount, setVisibleCount] = useState(25);
  const [alertQuery, setAlertQuery] = useState("");
  const [alertRules, setAlertRules] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<{ query: string; rules: string[] }[]>([]);
  const [referenceTime] = useState(() => Date.now());
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [marketContext, setMarketContext] = useState<MarketContext>({ prices: [], statements: [] });

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const saved = localStorage.getItem("civic-ledger-watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
      const savedAlerts = localStorage.getItem("civic-ledger-alerts");
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    }, 0);
    fetch("/api/trades?limit=500")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (payload.mode !== "live" || !payload.trades?.length) return;
        const liveRecords: Trade[] = payload.trades.map((row: Record<string, unknown>) => {
          const member = String(row.member ?? "Unknown filer");
          const traded = String(row.traded ?? "");
          const filed = String(row.filed ?? "");
          const delay = Math.max(0, Math.round((Date.parse(filed) - Date.parse(traded)) / 86400000));
          return {
            id: Number(row.id), member, initials: member.split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase(),
            party: (row.party === "R" ? "R" : "D"), chamber: row.chamber === "Senate" ? "Senate" : "House",
            state: String(row.state ?? ""), ticker: String(row.ticker ?? "N/A"), company: String(row.company ?? "Unresolved asset"),
            action: row.action === "Sale" ? "Sale" : "Purchase", owner: String(row.owner ?? "Not specified"),
            amount: String(row.amount ?? "Range unavailable"), traded, filed, delay, signal: 0, committee: "Source-verified record",
            sourceUrl: String(row.sourceUrl ?? ""), confidence: Number(row.confidence ?? 0),
          };
        });
        setRecords(liveRecords); setDataMode("live");
      })
      .catch(() => undefined);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (dataMode !== "live") return;
    fetch(`/api/context?ticker=${encodeURIComponent(selectedTicker)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => setMarketContext({ prices: payload.prices ?? [], statements: payload.statements ?? [] }))
      .catch(() => setMarketContext({ prices: [], statements: [] }));
  }, [selectedTicker, dataMode]);

  const formatDate = (value: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(`${value}T12:00:00Z`)) : "—";

  const toggleAlertRule = (rule: string) => setAlertRules((current) => current.includes(rule) ? current.filter((item) => item !== rule) : [...current, rule]);

  const saveAlert = () => {
    if (!alertQuery.trim() && alertRules.length === 0) return;
    const next = [...alerts, { query: alertQuery.trim(), rules: alertRules }];
    setAlerts(next); localStorage.setItem("civic-ledger-alerts", JSON.stringify(next));
    setAlertQuery(""); setAlertRules([]); setAlertOpen(false);
  };

  const exportCsv = () => {
    const rows = [["member","party","chamber","state","ticker","company","action","owner","range","transaction_date","filed_date","delay_days","source_url"],
      ...filtered.map((trade) => [trade.member,trade.party,trade.chamber,trade.state,trade.ticker,trade.company,trade.action,trade.owner,trade.amount,trade.traded,trade.filed,String(trade.delay),trade.sourceUrl ?? ""])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"','""')}"`).join(",")).join("\n");
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = href; link.download = "civic-ledger-view.csv"; link.click(); URL.revokeObjectURL(href);
  };

  const toggleWatch = (ticker: string) => {
    setWatchlist((current) => {
      const next = current.includes(ticker)
        ? current.filter((item) => item !== ticker)
        : [...current, ticker];
      localStorage.setItem("civic-ledger-watchlist", JSON.stringify(next));
      return next;
    });
  };

  const filtered = (() => {
    const needle = query.toLowerCase();
    const cutoff = referenceTime - Number(dateRange) * 86400000;
    return records.filter((trade) => {
      const matchesSearch = [trade.member, trade.ticker, trade.company, trade.committee]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchesChamber = chamber === "All Congress" || trade.chamber === chamber;
      const matchesWatch = !watchOnly || watchlist.includes(trade.ticker);
      const matchesAction = actionFilter === "All" || trade.action === actionFilter;
      const matchesDate = Date.parse(trade.traded) >= cutoff;
      return matchesSearch && matchesChamber && matchesWatch && matchesAction && matchesDate;
    });
  })();

  return (
    <main>
      <div className={`demo-ribbon ${dataMode === "live" ? "live" : ""}`}>{dataMode === "live" ? "Verified beta · live database records" : "Demo mode · every visible record and metric is illustrative"}</div>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Civic Ledger home">
          <span className="brand-mark">CL</span>
          <span>CIVIC <b>LEDGER</b></span>
        </a>
        <nav aria-label="Primary navigation">
          {["Activity", "Members", "Companies", "Signals"].map((tab) => (
            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Toggle watched stocks" onClick={() => setWatchOnly(!watchOnly)}>
            {watchOnly ? "★" : "☆"}<span>{watchlist.length}</span>
          </button>
          <button className="alert-button" onClick={() => setAlertOpen(true)}>Create alert <span>＋</span></button>
          <div className="avatar">EB</div>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow"><span className="live-dot" /> {dataMode === "live" ? "VERIFIED DISCLOSURE DATABASE" : "ILLUSTRATIVE PRODUCT WALKTHROUGH"}</p>
          <h1>Follow the paper trail.<br /><em>See the signal.</em></h1>
          <p className="hero-copy">Every disclosed move, tied to its original filing and measured against committee influence, timing, and market context.</p>
        </div>
        <div className="market-card">
          <div className="market-card-head"><span>CONGRESSIONAL ACTIVITY</span><strong>30 DAYS</strong></div>
          <div className="market-number">$38.6M <small>illustrative volume · demo only</small></div>
          <svg viewBox="0 0 380 90" role="img" aria-label="Illustrative congressional activity trend">
            <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7a92e" stopOpacity=".34"/><stop offset="1" stopColor="#d7a92e" stopOpacity="0"/></linearGradient></defs>
            <path className="area" d={`M0,82 ${spark.map((v, i) => `L${i * 20},${94 - v}`).join(" ")} L380,90 L0,90Z`} />
            <path className="line" d={`M0,82 ${spark.map((v, i) => `L${i * 20},${94 - v}`).join(" ")}`} />
          </svg>
          <div className="market-stats"><span><b>286</b> filings</span><span><b>+18%</b> vs prior period</span><span><b>31d</b> median delay</span></div>
        </div>
      </section>

      <section className="signal-strip" id="signals" aria-label="Illustrative signals">
        <div className="strip-title"><span>DEMO SIGNALS</span><b>How context will surface</b></div>
        <article><span className="signal-icon">◎</span><div><small>BIPARTISAN CLUSTER</small><strong>4 members added <b>NVDA</b></strong><p>Across 3 committees · 9-day window</p></div><span className="score hot">94</span></article>
        <article><span className="signal-icon">⌁</span><div><small>COMMITTEE OVERLAP</small><strong>Defense buys accelerate</strong><p>Armed Services · 6 disclosures</p></div><span className="score">88</span></article>
        <article><span className="signal-icon">△</span><div><small>LATE FILING</small><strong>3 reports near deadline</strong><p>40+ days after transaction</p></div><span className="score muted">72</span></article>
      </section>

      <section className="activity-section" id="activity">
        <div className="section-head">
          <div><p className="eyebrow">THE LEDGER</p><h2>{activeTab === "Activity" ? "Latest disclosed activity" : activeTab === "Members" ? "Member activity" : activeTab === "Companies" ? "Company activity" : "Signal evidence"}</h2></div>
          <div className="section-meta"><span><i /> {dataMode === "live" ? "Database connected" : "Prototype dataset active"}</span><button onClick={exportCsv}>Export view ↗</button></div>
        </div>

        <div className="filterbar">
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search member, ticker, company, committee…" /></label>
          <label><span className="sr-only">Chamber</span><select value={chamber} onChange={(e) => setChamber(e.target.value)}><option>All Congress</option><option>House</option><option>Senate</option></select></label>
          <label><span className="sr-only">Date range</span><select value={dateRange} onChange={(e) => setDateRange(e.target.value)}><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="3650">All available</option></select></label>
          <label><span className="sr-only">Transaction</span><select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}><option>All</option><option>Purchase</option><option>Sale</option></select></label>
          <button className={`watch-filter ${watchOnly ? "selected" : ""}`} onClick={() => setWatchOnly(!watchOnly)}>★ Watched</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Member</th><th>Asset</th><th>Move</th><th>Disclosed range</th><th>Timeline</th><th>Signal</th><th><span className="sr-only">Watch</span></th></tr></thead>
            <tbody>
              {filtered.slice(0, visibleCount).map((trade) => (
                <tr key={trade.id}>
                  <td><div className="member-cell"><span className={`member-avatar ${trade.party}`}>{trade.initials}</span><div><strong>{trade.member}</strong><small>{trade.party} · {trade.state} · {trade.chamber}</small></div></div></td>
                  <td><button className={`asset-cell asset-button ${selectedTicker === trade.ticker ? "selected" : ""}`} onClick={() => setSelectedTicker(trade.ticker)}><span>{trade.ticker.slice(0, 1)}</span><div><strong>{trade.ticker}</strong><small>{trade.company}</small></div></button></td>
                  <td><span className={`transaction ${trade.action === "Purchase" ? "buy" : "sell"}`}>{trade.action === "Purchase" ? "↗" : "↘"} {trade.action}</span><small className="owner">{trade.owner}</small></td>
                  <td><strong className="range">{trade.amount}</strong><small className="estimated">Range disclosed</small></td>
                  <td><div className="timeline"><span><small>TRADED</small>{formatDate(trade.traded)}</span><i /><span><small>FILED</small>{formatDate(trade.filed)}</span><b className={trade.delay >= 40 ? "late" : ""}>{trade.delay}d</b></div></td>
                  <td><div className="signal-cell"><span className={trade.signal > 85 ? "high" : ""}>{dataMode === "live" ? "✓" : trade.signal}</span><div><b>{dataMode === "live" ? "Source verified" : trade.signal > 85 ? "Demo: high relevance" : trade.signal > 75 ? "Demo: notable" : "Demo: routine"}</b><small>{trade.sourceUrl ? <a href={trade.sourceUrl} target="_blank" rel="noreferrer">Open original filing ↗</a> : trade.committee}</small></div></div></td>
                  <td><button className={`star ${watchlist.includes(trade.ticker) ? "watched" : ""}`} onClick={() => toggleWatch(trade.ticker)} aria-label={`${watchlist.includes(trade.ticker) ? "Remove" : "Add"} ${trade.ticker} ${watchlist.includes(trade.ticker) ? "from" : "to"} watchlist`}>{watchlist.includes(trade.ticker) ? "★" : "☆"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><strong>No disclosures match this view.</strong><span>Try removing a filter or searching another ticker.</span></div>}
        </div>
        <div className="table-footer"><span>Showing {Math.min(filtered.length, visibleCount)} of {filtered.length} {dataMode === "live" ? "verified" : "illustrative"} records</span><button disabled={visibleCount >= filtered.length} onClick={() => setVisibleCount((count) => count + 25)}>Load more activity ↓</button><span>Ranges preserved; positions remain estimates</span></div>
      </section>

      <section className="context-section" id="context">
        <div className="context-heading"><div><p className="eyebrow">MARKET + PUBLIC RECORD CONTEXT</p><h2>{selectedTicker} price trail & leadership statements</h2></div><span className={`mode-pill ${dataMode}`}>{dataMode === "live" ? "Stored market snapshots" : "Feature preview"}</span></div>
        <div className="context-grid">
          <article className="price-panel">
            <div className="panel-head"><div><small>PRICE FOLLOWER</small><strong>{selectedTicker}</strong></div><span>{dataMode === "live" ? (marketContext.prices.length ? `${marketContext.prices.length} snapshots` : "No snapshots") : "Demo curve"}</span></div>
            {dataMode === "live" && marketContext.prices.length === 0 ? <div className="price-empty"><strong>No licensed price snapshot stored.</strong><span>The chart stays empty until a sourced observation is ingested.</span></div> : <div className="price-bars" aria-label={`${selectedTicker} ${dataMode === "live" ? "stored" : "illustrative"} price trend`}>
              {(dataMode === "live" ? [...marketContext.prices].reverse().slice(-24).map((item) => item.close) : demoPrices).map((price, index, values) => {
                const min = Math.min(...values); const max = Math.max(...values); const height = 25 + ((price - min) / Math.max(1, max - min)) * 70;
                return <i key={`${price}-${index}`} style={{ height: `${height}%` }} title={`${dataMode === "live" ? "$" : "Demo $"}${price}`} />;
              })}
            </div>}
            <p>{dataMode === "live" ? "Prices are stored with observation date, provider, source URL, and retrieval time. Exchange licensing determines permitted freshness." : "Illustrative only. Production prices are stored as dated snapshots from a licensed provider; the demo curve is not market data."}</p>
          </article>
          <article className="statements-panel">
            <div className="panel-head"><div><small>OFFICIAL STATEMENT LINKS</small><strong>Leadership record</strong></div><span>{marketContext.statements.length} statement links</span></div>
            {dataMode === "live" && marketContext.statements.length ? <div className="statement-list">{marketContext.statements.map((statement) => <a key={statement.id} href={statement.sourceUrl} target="_blank" rel="noreferrer"><span>{statement.sourceType} · {formatDate(statement.publishedAt)}</span><strong>{statement.title}</strong><p>{statement.excerpt}</p><small>{statement.speakerName}{statement.leadershipRole ? ` · ${statement.leadershipRole}` : ""} · {Math.round(statement.relevanceScore * 100)}% relevance {statement.reviewed ? "· reviewed" : "· automated match"}</small></a>)}</div> : <div className="context-empty"><strong>No statement is being implied.</strong><p>When a congressional leader publicly discusses {selectedTicker}, its company, or its industry, this panel links the official source and explains the match. A link shows topical relevance—not intent, inside information, or causation.</p><div><span>Congressional Record</span><span>Official press releases</span><span>Committee hearings</span></div></div>}
          </article>
        </div>
      </section>

      <section className="trust-grid" id="standard">
        <div><p className="eyebrow">THE CIVIC LEDGER STANDARD</p><h2>Receipts before rankings.</h2><p>Congressional disclosures are delayed and report value ranges—not exact share counts. We keep those limits visible instead of turning estimates into certainty.</p></div>
        <article><span>01</span><h3>Original filing attached</h3><p>Every normalized record traces back to the House Clerk or Senate eFD report.</p></article>
        <article><span>02</span><h3>Time has two clocks</h3><p>Transaction date and public filing date stay separate, with the delay measured.</p></article>
        <article><span>03</span><h3>Estimates stay estimates</h3><p>Holdings and performance use disclosed ranges and visible methodology.</p></article>
      </section>

      <footer><div className="brand"><span className="brand-mark">CL</span><span>CIVIC <b>LEDGER</b></span></div><p>Public-record market intelligence. Not investment advice.</p><div><a href="https://github.com/flipcyde101/civic-ledger" target="_blank" rel="noreferrer">Source code</a><a href="https://disclosures-clerk.house.gov/FinancialDisclosure" target="_blank" rel="noreferrer">House source</a><a href="https://efdsearch.senate.gov/search/home/" target="_blank" rel="noreferrer">Senate source</a></div></footer>

      {alertOpen && <div className="modal-backdrop" onMouseDown={() => setAlertOpen(false)} onKeyDown={(e) => e.key === "Escape" && setAlertOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="alert-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setAlertOpen(false)} aria-label="Close">×</button><p className="eyebrow">CUSTOM SIGNAL · SAVED ON THIS DEVICE</p><h2 id="alert-title">Create a filing alert</h2><p>Choose any combination of member, ticker, committee, transaction type, or disclosure delay. {alerts.length} saved.</p><label>Watch for<input value={alertQuery} onChange={(e) => setAlertQuery(e.target.value)} placeholder="e.g. NVDA or Armed Services" autoFocus /></label><div className="modal-options">{["Any purchase","Signal 80+","Delay 30d+"].map((rule) => <button key={rule} className={alertRules.includes(rule) ? "selected" : ""} onClick={() => toggleAlertRule(rule)}>{rule}</button>)}</div><button className="save-alert" disabled={!alertQuery.trim() && alertRules.length === 0} onClick={saveAlert}>Save alert</button></section></div>}
    </main>
  );
}
