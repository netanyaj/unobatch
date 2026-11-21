import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Partner match · First Batch prototype",
  description: "Turn a brand's brief into a ranked list of partners, with reasons and gaps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Partner match
            </Link>
            <nav className="flex gap-1">
              <Button variant="ghost" size="sm" asChild><Link href="/">New brief</Link></Button>
              <Button variant="ghost" size="sm" asChild><Link href="/gaps">Network gaps</Link></Button>
            </nav>
            <Badge variant="outline" className="ml-auto rounded-full border-amber-300 bg-amber-50 px-3 py-1 text-amber-800">
              Sample data, not First Batch&apos;s real network
            </Badge>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
