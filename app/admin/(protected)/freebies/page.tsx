"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadField } from "@/components/admin/upload-field";
import { FREEBIE_TYPES } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Freebie = {
  id: string; title: string; type: string; description: string; platform: string;
  url: string; imageUrl: string | null; priceOriginal: string | null; priceDeal: string | null;
  endsAt: string | null; active: boolean; createdAt: string;
};

const EMPTY = {
  title: "", type: "free", description: "", platform: "", url: "",
  imageUrl: "", priceOriginal: "", priceDeal: "", endsAt: "", active: true,
};

export default function AdminFreebiesPage() {
  const [freebies, setFreebies] = useState<Freebie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/freebies");
    if (res.ok) setFreebies((await res.json()).freebies);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError("");
    setDialogOpen(true);
  }
  function openEdit(f: Freebie) {
    setEditingId(f.id);
    setForm({
      title: f.title, type: f.type, description: f.description, platform: f.platform,
      url: f.url, imageUrl: f.imageUrl || "",
      priceOriginal: f.priceOriginal || "", priceDeal: f.priceDeal || "",
      endsAt: f.endsAt ? f.endsAt.slice(0, 10) : "", active: f.active,
    });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(editingId ? `/api/admin/freebies/${editingId}` : "/api/admin/freebies", {
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
    if (!confirm("Delete this freebie?")) return;
    await fetch(`/api/admin/freebies/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(f: Freebie) {
    await fetch(`/api/admin/freebies/${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, endsAt: f.endsAt || "", active: !f.active }),
    });
    load();
  }

  const typeBadge: Record<string, string> = {
    free: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
    giveaway: "border-amber-400/50 text-amber-300 bg-amber-400/10",
    deal: "border-primary/60 text-primary bg-primary/10",
  };

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Content</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Freebies &amp; Deals</h1>
        </div>
        <Button onClick={openCreate} className="btn-glow rounded-none bg-primary font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> New Freebie
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading freebies" />
        </div>
      ) : freebies.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No freebies yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card clip-corner-sm">
          {freebies.map((f) => (
            <li key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative hidden h-14 w-24 shrink-0 overflow-hidden border border-border bg-secondary sm:block">
                {f.imageUrl && <Image src={f.imageUrl} alt="" fill unoptimized className="img-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`border px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest ${typeBadge[f.type] || typeBadge.deal}`}>
                    {f.type}
                  </span>
                  {!f.active && (
                    <span className="border border-border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-medium">{f.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {f.platform} · {f.url} {f.endsAt && `· ends ${formatDate(f.endsAt)}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => toggleActive(f)} title={f.active ? "Hide" : "Show"} className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Power className="h-4 w-4" />
                </button>
                <button onClick={() => openEdit(f)} title="Edit" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(f.id)} title="Delete" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
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
            <DialogTitle className="font-display uppercase tracking-wide">{editingId ? "Edit Freebie" : "New Freebie"}</DialogTitle>
            <DialogDescription>Free game, giveaway or deal with an outbound link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Rocket League — Free on Epic" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREEBIE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What is it and why grab it?" className="rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
                <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. Epic Games, PC" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Ends on</Label>
                <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="h-11 rounded-none bg-background/60" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Outbound link *</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://store.epicgames.com/…" className="h-11 rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Original price</Label>
                <Input value={form.priceOriginal} onChange={(e) => setForm({ ...form, priceOriginal: e.target.value })} placeholder="$39.99" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Deal price</Label>
                <Input value={form.priceDeal} onChange={(e) => setForm({ ...form, priceDeal: e.target.value })} placeholder="Free" className="h-11 rounded-none bg-background/60" />
              </div>
            </div>
            <UploadField label="Image (optional)" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="active" />
              <Label htmlFor="active" className="text-sm text-muted-foreground">Show on site</Label>
            </div>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
              <Button onClick={save} disabled={saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Add freebie"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
