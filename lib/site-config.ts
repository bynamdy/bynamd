/**
 * Client-safe site constants — NO database imports here.
 * Client components must import from this module (not @/lib/site),
 * because @/lib/site touches Prisma and would drag it into the browser bundle.
 */

export const SITE_NAME = "Bynamdy";
export const SITE_TAGLINE = "Game News, Codes & Gear";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://bynamdy.com").replace(/\/$/, "");
}

/** Editable site texts (managed from the admin dashboard, "Page Text"). */
export const CONTENT_DEFAULTS: Record<string, string> = {
  tagline: "Game News, Codes & Gear",
  hero_badge: "Your #1 Gaming HQ — Worldwide & Nigeria",
  hero_title: "LEVEL UP YOUR GAME",
  hero_subtitle:
    "Fresh game news, working cheat codes, epic wallpapers, freebies and the best gear — all in one place.",
  news_section_title: "Latest News",
  codes_section_title: "Trending Cheat Codes",
  wallpapers_section_title: "Featured Wallpapers",
  newsletter_title: "JOIN THE SQUAD",
  newsletter_text:
    "Get the hottest game news, freebies and cheat codes in your inbox every week. No spam, unsubscribe anytime.",
  about_title: "About Bynamdy",
  about_body: `Bynamdy is a gaming media hub built for players everywhere — from Lagos to Los Angeles.
We cover breaking game news, patch updates and release info; we curate working cheat codes for PC, PlayStation, Xbox and Mobile; we give away hand-picked 4K wallpapers; and we track free games, giveaways and deals across every major store.

Our mission is simple: keep every gamer informed, geared up and winning — without paywalls or clickbait.

Whether you grind AAA titles on console, climb ranks on mobile, or you are hunting the best price on your next headset, Bynamdy has your back.`,
  contact_title: "Contact Us",
  contact_text:
    "Got a scoop, a partnership idea, an ad inquiry or a correction? Drop us a message — we read everything and reply within 48 hours.",
  store_note:
    "Disclosure: we earn a small commission from affiliate links at no extra cost to you. This keeps Bynamdy free.",
  freebies_note:
    "We track free games, giveaways and hot deals across Epic, Steam, GOG, Prime Gaming and more. Grab them before they expire!",
  footer_text: "Built for gamers, by gamers. Worldwide & Nigeria.",
  meta_home_title: "Bynamdy — Game News, Codes & Gear",
  meta_home_description:
    "Bynamdy brings you the latest game news, working cheat codes for PC, PlayStation, Xbox & Mobile, 4K wallpapers, free games and the best gaming gear deals.",
};

export type SiteContent = Record<string, string>;

/** Human labels for editable keys shown in the admin Page Text editor. */
export const CONTENT_LABELS: Record<string, string> = {
  tagline: "Site Tagline",
  hero_badge: "Home — Hero Badge",
  hero_title: "Home — Hero Title",
  hero_subtitle: "Home — Hero Subtitle",
  news_section_title: "Home — News Section Title",
  codes_section_title: "Home — Cheat Codes Section Title",
  wallpapers_section_title: "Home — Wallpapers Section Title",
  newsletter_title: "Newsletter Box — Title",
  newsletter_text: "Newsletter Box — Text",
  about_title: "About Page — Title",
  about_body: "About Page — Body",
  contact_title: "Contact Page — Title",
  contact_text: "Contact Page — Intro Text",
  store_note: "Store — Affiliate Disclosure",
  freebies_note: "Freebies — Intro Text",
  footer_text: "Footer — Tagline Text",
  meta_home_title: "SEO — Home Meta Title",
  meta_home_description: "SEO — Home Meta Description",
};

export const ARTICLE_CATEGORIES = [
  { value: "news", label: "Game News" },
  { value: "updates", label: "Updates" },
  { value: "releases", label: "Releases" },
] as const;

export const PLATFORMS = ["PC", "PlayStation", "Xbox", "Mobile"] as const;
export const WALLPAPER_CATEGORIES = ["Games", "Cars", "Sci-Fi", "Abstract", "Anime"] as const;
export const FREEBIE_TYPES = [
  { value: "free", label: "Free Game" },
  { value: "giveaway", label: "Giveaway" },
  { value: "deal", label: "Deal" },
] as const;
export const STORE_CATEGORIES = [
  "Headsets",
  "Keyboards",
  "Mice",
  "Controllers",
  "Monitors",
  "Chairs",
  "Accessories",
] as const;
