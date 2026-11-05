import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { getContent } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach the Bnamdy team — send a news scoop, partnership proposal, ad inquiry or feedback. We reply within 48 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Bnamdy | Bynamdy",
    description: "Send a news scoop, partnership proposal, ad inquiry or feedback. We reply within 48 hours.",
    type: "website",
  },
};

export default async function ContactPage() {
  const content = await getContent();

  return (
    <div className="fade-up mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-2">
        <p className="kicker">We read everything</p>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-5xl">
          {content.contact_title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-primary text-glow">{content.contact_title.split(" ").slice(-1)}</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {content.contact_text}
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
        <aside className="space-y-4 lg:col-span-2">
          {[
            { icon: Mail, title: "Email", lines: ["hello@bynamdy.com", "tips@bynamdy.com"] },
            { icon: MapPin, title: "Locations", lines: ["Worldwide (Remote)", "Lagos, Nigeria"] },
            { icon: Clock, title: "Response Time", lines: ["Within 48 hours", "Mon – Sat"] },
          ].map(({ icon: Icon, title, lines }) => (
            <div key={title} className="glow-hover border border-border bg-card p-5 clip-corner-sm">
              <div className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest">{title}</h2>
              </div>
              {lines.map((l) => (
                <p key={l} className="mt-2 text-sm text-muted-foreground">{l}</p>
              ))}
            </div>
          ))}
          <div className="border border-primary/40 bg-primary/10 p-5 clip-corner-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
              Got a news scoop?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Leaks, patch notes, local gaming events in Nigeria — send them in and get credited.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
