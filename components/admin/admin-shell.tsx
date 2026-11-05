"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Gamepad2,
  LayoutDashboard,
  Newspaper,
  Trophy,
  Images,
  Gift,
  ShoppingBag,
  FileText,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/news", label: "News Articles", icon: Newspaper },
  { href: "/admin/codes", label: "Cheat Codes", icon: Trophy },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: Images },
  { href: "/admin/freebies", label: "Freebies & Deals", icon: Gift },
  { href: "/admin/store", label: "Store Products", icon: ShoppingBag },
  { href: "/admin/pages", label: "Page Text & SEO", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Account Settings", icon: Settings },
];

export function AdminShell({
  children,
  email,
  unread,
}: {
  children: React.ReactNode;
  email: string;
  unread: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Admin navigation">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-display uppercase tracking-wider transition-all",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {href === "/admin/messages" && unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* topbar (mobile) */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-primary clip-corner-sm">
            <Gamepad2 className="h-4 w-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-widest">
            By<span className="text-primary">namdy</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center border border-border clip-corner-sm"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 z-30 flex flex-col bg-background lg:hidden">
          {nav}
          <div className="border-t border-border p-3">
            <LogoutButton onClick={logout} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
          <Link href="/admin" className="flex h-16 items-center gap-2.5 border-b border-border px-5">
            <span className="flex h-8 w-8 items-center justify-center bg-primary clip-corner-sm shadow-[0_0_14px_rgba(230,20,45,0.45)]">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" aria-hidden />
            </span>
            <div>
              <p className="font-display text-base font-bold uppercase leading-none tracking-widest">
                By<span className="text-primary">namdy</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Control Room</p>
            </div>
          </Link>
          {nav}
          <div className="border-t border-border p-3">
            <p className="truncate px-3 pb-2 text-xs text-muted-foreground" title={email}>{email}</p>
            <div className="flex gap-2">
              <LogoutButton onClick={logout} compact />
              <Link
                href="/"
                target="_blank"
                className="flex h-9 flex-1 items-center justify-center gap-1.5 border border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View site
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function LogoutButton({ onClick, compact }: { onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm",
        compact ? "h-9 px-3 text-xs" : "h-10 w-full text-sm"
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden /> Logout
    </button>
  );
}
