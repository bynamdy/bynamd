"use client";

import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMessage(data.message || "You're in! Watch your inbox.");
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-primary/40 bg-primary/10 px-4 py-3.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="h-12 rounded-none border-border bg-background/60 pl-10 text-sm"
          aria-label="Email address"
        />
      </div>
      <Button
        type="submit"
        disabled={state === "loading"}
        className="btn-glow h-12 rounded-none bg-primary px-6 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground clip-corner-sm"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Subscribe <Send className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
      {state === "error" && (
        <p className="text-xs text-red-400 sm:hidden" role="alert">{message}</p>
      )}
    </form>
  );
}
