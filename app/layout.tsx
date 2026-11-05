import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/site";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Bynamdy — Game News, Codes & Gear",
    template: "%s | Bynamdy",
  },
  description:
    "Bynamdy brings you the latest game news, working cheat codes for PC, PlayStation, Xbox & Mobile, 4K wallpapers, free games and the best gaming gear deals.",
  keywords: [
    "game news",
    "cheat codes",
    "gaming wallpapers",
    "free games",
    "gaming gear",
    "gaming Nigeria",
    "game deals",
  ],
  applicationName: "Bynamdy",
  openGraph: {
    type: "website",
    siteName: "Bynamdy",
    title: "Bynamdy — Game News, Codes & Gear",
    description:
      "Latest game news, working cheat codes, 4K wallpapers, freebies and the best gaming gear.",
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Bynamdy — Game News, Codes & Gear",
    description: "Latest game news, cheat codes, wallpapers, freebies and gear deals.",
  },
  icons: { icon: "/logo.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${chakra.variable} ${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
