import Link from "next/link";
import { Gamepad2, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { getContent, SITE_NAME } from "@/lib/site";

const FOOTER_NAV = [
  { href: "/news", label: "Game News" },
  { href: "/codes", label: "Cheat Codes" },
  { href: "/wallpapers", label: "Wallpapers" },
  { href: "/freebies", label: "Freebies" },
  { href: "/store", label: "Gear Store" },
];

const FOOTER_NAV2 = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/news?category=releases", label: "New Releases" },
  { href: "/news?category=updates", label: "Game Updates" },
  { href: "/codes?platform=Mobile", label: "Mobile Codes" },
];

export async function SiteFooter() {
  const content = await getContent();
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center bg-primary clip-corner-sm shadow-[0_0_16px_rgba(230,20,45,0.45)]">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" aria-hidden />
              </span>
              <span className="font-display text-xl font-bold tracking-widest uppercase">
                By<span className="text-primary">namdy</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {content.footer_text}
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Twitter, label: "Twitter / X" },
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`${SITE_NAME} on ${label}`}
                  className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-[0_0_14px_rgba(230,20,45,0.4)] clip-corner-sm"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer content links">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer more links">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
              More
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV2.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" aria-hidden />
                hello@bynamdy.com
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                Worldwide &middot; Lagos, Nigeria
              </li>
            </ul>
            <p className="mt-5 text-xs text-muted-foreground/70 leading-relaxed">
              Bynamdy may earn commissions from affiliate links. This never affects our picks.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">
            Play Hard &middot; Stay Updated
          </p>
        </div>
      </div>
    </footer>
  );
}
