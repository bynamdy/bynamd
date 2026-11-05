import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function formatPrice(value: number, currency = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency === "NGN" ? "₦" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : `${currency} `
  const formatted = value % 1 === 0 ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol}${formatted}`
}

export function categoryLabel(value: string): string {
  switch (value) {
    case "news": return "Game News"
    case "updates": return "Updates"
    case "releases": return "Releases"
    default: return value
  }
}

