"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setState("done");
        setFeedback(json.message);
        form.reset();
      } else {
        setState("error");
        setFeedback(json.error || "Something went wrong.");
      }
    } catch {
      setState("error");
      setFeedback("Network error. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-start gap-3 border border-primary/40 bg-primary/10 px-5 py-6 clip-corner-sm">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-display font-semibold uppercase tracking-wide">Message sent!</p>
          <p className="mt-1 text-sm text-muted-foreground">{feedback}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Name *
          </Label>
          <Input id="name" name="name" required maxLength={100} placeholder="Your name" className="h-12 rounded-none bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Email *
          </Label>
          <Input id="email" name="email" type="email" required maxLength={200} placeholder="your@email.com" className="h-12 rounded-none bg-background/60" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Subject
        </Label>
        <Input id="subject" name="subject" maxLength={150} placeholder="Scoop, partnership, ad inquiry…" className="h-12 rounded-none bg-background/60" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Message *
        </Label>
        <Textarea id="message" name="message" required maxLength={5000} rows={6} placeholder="What's on your mind, gamer?" className="rounded-none bg-background/60" />
      </div>
      {state === "error" && (
        <p className="text-sm text-red-400" role="alert">{feedback}</p>
      )}
      <Button
        type="submit"
        disabled={state === "loading"}
        className="btn-glow h-12 w-full rounded-none bg-primary font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm sm:w-auto sm:px-10"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send Message <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
