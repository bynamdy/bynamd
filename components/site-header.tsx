"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Gamepad2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/codes", label: "Cheat Codes" },
  { href: "/wallpapers", label: "Wallpapers" },
  { href: "/freebies", label: "Freebies" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      {/* top accent strip */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Bynamdy home">
          <span className="relative flex h-9 w-9 items-center justify-center bg-primary clip-corner-sm shadow-[0_0_16px_rgba(230,20,45,0.45)] group-hover:shadow-[0_0_26px_rgba(230,20,45,0.7)] transition-shadow">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold tracking-widest uppercase">
            By<span className="text-primary text-glow">namdy</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-[13px] font-display font-medium uppercase tracking-wider transition-colors hover:text-primary",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-primary shadow-[0_0_10px_rgba(230,20,45,0.9)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* mobile toggle */}
        <button
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center border border-border text-foreground hover:border-primary hover:text-primary transition-colors clip-corner-sm"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile nav */}
      {open && (
        <nav className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md" aria-label="Mobile navigation">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 font-display text-sm uppercase tracking-wider border-l-2 transition-colors",
                  isActive(item.href)
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-primary hover:border-primary/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
