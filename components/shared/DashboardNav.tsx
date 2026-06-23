"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  BookOpen,
  PenLine,
  BarChart3,
  Wrench,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen, match: "/modules" },
  { href: "/practice", label: "Practice", icon: PenLine },
  { href: "/important", label: "Important", icon: ClipboardList, match: "/important" },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/exam-prep", label: "Exams", icon: ClipboardList, match: "/exam-prep" },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden sm:inline">StatMaster</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.match ? pathname.startsWith(item.match) : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Guest mode
            </span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t p-4 space-y-1">
            {navItems.map((item) => {
              const active = item.match ? pathname.startsWith(item.match) : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const active = item.match ? pathname.startsWith(item.match) : pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center p-1 text-xs", active ? "text-primary" : "text-muted-foreground")}>
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[4rem]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
