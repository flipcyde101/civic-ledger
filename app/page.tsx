import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Civic Ledger | Congressional market intelligence",
  description:
    "Trace congressional securities disclosures from original filing to market context.",
};

export default function Home() {
  return <Dashboard />;
}
