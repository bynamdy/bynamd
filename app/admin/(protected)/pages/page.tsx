"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type ContentMap = Record<string, string>;

export default function AdminPagesPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content);
        setOriginal(data.content);
        setLabels(data.labels);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const updates: ContentMap = {};
    for (const key of Object.keys(content)) {
      if (content[key] !== original[key]) updates[key] = content[key];
    }
    const res = await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    if (res.ok) {
      setOriginal({ ...content });
      toast({ title: "Saved", description: "Page text updated across the site." });
    } else {
      toast({ title: "Error", description: "Could not save. Try again.", variant: "destructive" });
    }
  }

  function reset() {
    setContent({ ...original });
  }

  if (loading)
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading page text" />
      </div>
    );

  const dirty = JSON.stringify(content) !== JSON.stringify(original);
  const keys = Object.keys(labels);

  const longKeys = keys.filter((k) => k.includes("body") || k.includes("description") || k === "newsletter_text" || k === "contact_text" || k === "store_note" || k === "freebies_note" || k === "footer_text" || k === "hero_subtitle");

  return (
    <div className="fade-up mx-auto max-w-3xl space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Site settings</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Page Text &amp; SEO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit the tagline, headlines, intro texts and home meta tags. Changes go live immediately.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {keys.map((key) => (
          <div key={key} className="border border-border bg-card p-4 clip-corner-sm">
            <Label htmlFor={key} className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              {labels[key] || key}
              <span className="ml-2 font-mono text-[10px] normal-case tracking-normal text-muted-foreground/60">{key}</span>
            </Label>
            {longKeys.includes(key) ? (
              <Textarea
                id={key}
                value={content[key] || ""}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                rows={key === "about_body" ? 8 : 3}
                className="mt-2 rounded-none bg-background/60"
              />
            ) : (
              <Input
                id={key}
                value={content[key] || ""}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                className="mt-2 h-10 rounded-none bg-background/60"
              />
            )}
          </div>
        ))}
      </div>

      {/* sticky save bar */}
      <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-3 border border-border bg-background/95 p-3 backdrop-blur clip-corner-sm">
        <span className="pl-2 text-xs text-muted-foreground">
          {dirty ? "You have unsaved changes" : "All changes saved"}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} disabled={!dirty || saving} className="rounded-none">
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
          <Button onClick={save} disabled={!dirty || saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1.5 h-4 w-4" /> Save changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
