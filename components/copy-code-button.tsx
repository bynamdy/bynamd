"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyCodeButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={`Copy code ${code}`}
      className={cn(
        "inline-flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-2.5 py-1.5 font-mono text-xs text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_14px_rgba(230,20,45,0.5)] clip-corner-sm",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
