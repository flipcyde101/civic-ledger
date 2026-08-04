import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Ledger | Congressional market intelligence",
  description: "Trace every congressional securities disclosure from filing to market context.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Civic Ledger",
    description: "Follow the paper trail. See the signal.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Civic Ledger — Follow the paper trail. See the signal." }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
