"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KanbanSquare, Plus, UserPlus } from "lucide-react";

const LINKS = [
  { href: "/", label: "Pipeline", icon: KanbanSquare },
  { href: "/recruiting", label: "Recruiting", icon: UserPlus },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">U</span>
          Uno Batch
        </Link>
        <nav className="flex h-full items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Button key={href} variant="ghost" size="sm" asChild
                className={cn("text-muted-foreground", active && "bg-accent text-foreground")}>
                <Link href={href} aria-current={active ? "page" : undefined}><Icon />{label}</Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline" title="All partners and briefs are made up. This is not First Batch's real network."
            className="rounded-full border-amber-300 bg-amber-50 text-amber-800">
            Sample data
          </Badge>
          <Button size="sm" asChild className={cn(path === "/new" && "pointer-events-none opacity-60")}>
            <Link href="/new"><Plus />New brief</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
