"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadField } from "@/components/admin/upload-field";
import { WALLPAPER_CATEGORIES } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Wallpaper = {
  id: string; slug: string; title: string; category: string; imageUrl: string;
  tags: string; resolution: string; downloads: number; featured: boolean; createdAt: string;
};

const EMPTY = { title: "", category: "Games", imageUrl: "", tags: "", resolution: "3840x2160", featured: false };

export default function AdminWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/wallpapers");
    if (res.ok) setWallpapers((await res.json()).wallpapers);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError("");
    setDialogOpen(true);
  }
  function openEdit(w: Wallpaper) {
    setEditingId(w.id);
    setForm({ title: w.title, category: w.category, imageUrl: w.imageUrl, tags: w.tags, resolution: w.resolution, featured: w.featured });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(editingId ? `/api/admin/wallpapers/${editingId}` : "/api/admin/wallpapers", {
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
    if (!confirm("Delete this wallpaper?")) return;
    await fetch(`/api/admin/wallpapers/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleFeatured(w: Wallpaper) {
    await fetch(`/api/admin/wallpapers/${w.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...w, featured: !w.featured }),
    });
    load();
  }

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Content</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Wallpapers</h1>
        </div>
        <Button onClick={openCreate} className="btn-glow rounded-none bg-primary font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> New Wallpaper
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading wallpapers" />
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No wallpapers yet. Upload your first!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallpapers.map((w) => (
            <div key={w.id} className="overflow-hidden border border-border bg-card clip-corner-sm">
              <div className="relative aspect-video">
                {w.imageUrl && <Image src={w.imageUrl} alt={w.title} fill unoptimized className="img-cover" />}
                {w.featured && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 bg-primary px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest text-primary-foreground">
                    <Star className="h-3 w-3" aria-hidden /> Featured
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="truncate font-medium">{w.title}</p>
                <p className="text-xs text-muted-foreground">
                  {w.category} · {w.resolution} · {w.downloads} downloads · {formatDate(w.createdAt)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggleFeatured(w)} title="Toggle featured" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(w)} title="Edit" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(w.id)} title="Delete" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">{editingId ? "Edit Wallpaper" : "New Wallpaper"}</DialogTitle>
            <DialogDescription>Upload an image file (needs Supabase Storage) or paste any image URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Neon Rider 4K" className="h-11 rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WALLPAPER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Resolution</Label>
                <Input value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} placeholder="3840x2160" className="h-11 rounded-none bg-background/60" />
              </div>
            </div>
            <UploadField label="Wallpaper Image *" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="featured" />
              <Label htmlFor="featured" className="text-sm text-muted-foreground">Feature on homepage</Label>
            </div>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
              <Button onClick={save} disabled={saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Add wallpaper"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
