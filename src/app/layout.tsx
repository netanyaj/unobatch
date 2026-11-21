import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Partner match · First Batch prototype",
  description: "Turn a brand's brief into a ranked list of partners, with reasons and gaps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Partner match
            </Link>
            <nav className="flex gap-4 text-sm text-stone-600">
              <Link href="/" className="hover:text-stone-900">New brief</Link>
              <Link href="/gaps" className="hover:text-stone-900">Network gaps</Link>
            </nav>
            <span className="ml-auto rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Sample data, not First Batch&apos;s real network
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
