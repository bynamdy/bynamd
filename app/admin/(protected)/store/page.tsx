"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadField } from "@/components/admin/upload-field";
import { STORE_CATEGORIES } from "@/lib/site-config";
import { formatPrice, formatDate } from "@/lib/utils";

type Product = {
  id: string; name: string; slug: string; description: string; price: number;
  oldPrice: number | null; currency: string; imageUrl: string | null;
  affiliateUrl: string; category: string; brand: string; featured: boolean; createdAt: string;
};

const EMPTY = {
  name: "", description: "", price: "", oldPrice: "", currency: "USD",
  imageUrl: "", affiliateUrl: "", category: "Headsets", brand: "", featured: false,
};

export default function AdminStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts((await res.json()).products);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError("");
    setDialogOpen(true);
  }
  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "", currency: p.currency,
      imageUrl: p.imageUrl || "", affiliateUrl: p.affiliateUrl,
      category: p.category, brand: p.brand, featured: p.featured,
    });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
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
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleFeatured(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: p.name, description: p.description, price: p.price, oldPrice: p.oldPrice || "",
        currency: p.currency, imageUrl: p.imageUrl || "", affiliateUrl: p.affiliateUrl,
        category: p.category, brand: p.brand, featured: !p.featured,
      }),
    });
    load();
  }

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Affiliate store</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Store Products</h1>
        </div>
        <Button onClick={openCreate} className="btn-glow rounded-none bg-primary font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> New Product
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading products" />
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No products yet. Add your first gear item!</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card clip-corner-sm">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden border border-border bg-secondary sm:block">
                {p.imageUrl && <Image src={p.imageUrl} alt="" fill unoptimized className="img-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                    {p.brand || p.category}
                  </span>
                  {p.featured && (
                    <span className="flex items-center gap-1 bg-primary/15 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-primary">
                      <Star className="h-3 w-3" aria-hidden /> Top pick
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(p.price, p.currency)} · {formatDate(p.createdAt)} ·
                  <span className="ml-1 truncate">{p.affiliateUrl.slice(0, 50)}…</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => toggleFeatured(p)} title="Toggle top pick" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Star className="h-4 w-4" />
                </button>
                <button onClick={() => openEdit(p)} title="Edit" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(p.id)} title="Delete" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
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
            <DialogTitle className="font-display uppercase tracking-wide">{editingId ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogDescription>Image, price and your affiliate link (placeholder links are fine — replace anytime).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Product name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Crimson Pro Wireless Headset" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. HyperX" className="h-11 rounded-none bg-background/60" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short pitch — what makes it great" className="rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Price *</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="89.99" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Old price</Label>
                <Input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} placeholder="119.99" className="h-11 rounded-none bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "NGN", "GBP", "EUR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STORE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Affiliate link *</Label>
              <Input value={form.affiliateUrl} onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })} placeholder="https://www.amazon.com/dp/XXXXX?tag=yourtag-20" className="h-11 rounded-none bg-background/60" />
            </div>
            <UploadField label="Product Image" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} aspect="aspect-square" />
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="top-pick" />
              <Label htmlFor="top-pick" className="text-sm text-muted-foreground">Show as Top Pick</Label>
            </div>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
              <Button onClick={save} disabled={saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Add product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
