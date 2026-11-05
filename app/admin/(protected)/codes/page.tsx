"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORMS } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Code = {
  id: string; slug: string; gameTitle: string; platform: string;
  code: string; effect: string; details: string | null; views: number; createdAt: string;
};

const EMPTY = { gameTitle: "", platform: "PC", code: "", effect: "", details: "" };

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/codes");
    if (res.ok) setCodes((await res.json()).codes);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError("");
    setDialogOpen(true);
  }
  function openEdit(c: Code) {
    setEditingId(c.id);
    setForm({ gameTitle: c.gameTitle, platform: c.platform, code: c.code, effect: c.effect, details: c.details || "" });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(editingId ? `/api/admin/codes/${editingId}` : "/api/admin/codes", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Save failed."); return; }
    setDialogOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this cheat code?")) return;
    await fetch(`/api/admin/codes/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = codes.filter((c) =>
    `${c.gameTitle} ${c.effect} ${c.code}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Content</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Cheat Codes</h1>
        </div>
        <Button onClick={openCreate} className="btn-glow rounded-none bg-primary font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> New Code
        </Button>
      </div>

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter codes…" className="h-11 max-w-sm rounded-none bg-background/60" />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading cheat codes" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No cheat codes found.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card clip-corner-sm">
          {filtered.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold uppercase tracking-wide">{c.gameTitle}</span>
                  <span className="border border-primary/50 bg-primary/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-primary">
                    {c.platform}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.effect}</p>
                <p className="mt-0.5 text-xs">
                  <code className="bg-secondary px-2 py-0.5 font-mono text-primary">{c.code}</code>
                  <span className="ml-2 text-muted-foreground">{c.views} views · {formatDate(c.createdAt)}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(c)} title="Edit" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(c.id)} title="Delete" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">{editingId ? "Edit Cheat Code" : "New Cheat Code"}</DialogTitle>
            <DialogDescription>Each code gets its own SEO-friendly details page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Game title *</Label>
              <Input value={form.gameTitle} onChange={(e) => setForm({ ...form, gameTitle: e.target.value })} placeholder="e.g. GTA San Andreas" className="h-11 rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. ROCKETMAN" className="h-11 rounded-none bg-background/60 font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Effect *</Label>
              <Input value={form.effect} onChange={(e) => setForm({ ...form, effect: e.target.value })} placeholder="e.g. Spawn Rhino tank" className="h-11 rounded-none bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Details / how to use</Label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={5} placeholder="Where to enter it, requirements, notes… Markdown supported" className="rounded-none bg-background/60" />
            </div>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
              <Button onClick={save} disabled={saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Add code"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
