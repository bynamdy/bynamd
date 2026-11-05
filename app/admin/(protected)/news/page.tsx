"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadField } from "@/components/admin/upload-field";
import { ARTICLE_CATEGORIES } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Article = {
  id: string; slug: string; title: string; category: string; excerpt: string;
  content: string; coverImage: string | null; seoTitle: string | null;
  seoDescription: string | null; published: boolean; views: number; createdAt: string;
};

const EMPTY = {
  title: "", category: "news", excerpt: "", content: "", coverImage: "",
  seoTitle: "", seoDescription: "", published: true,
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/articles");
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(a: Article) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      content: a.content,
      coverImage: a.coverImage || "",
      seoTitle: a.seoTitle || "",
      seoDescription: a.seoDescription || "",
      published: a.published,
    });
    setError("");
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(
      editingId ? `/api/admin/articles/${editingId}` : "/api/admin/articles",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Save failed."); return; }
    setDialogOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this article permanently?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublished(a: Article) {
    await fetch(`/api/admin/articles/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...a, coverImage: a.coverImage || "", seoTitle: a.seoTitle || "", seoDescription: a.seoDescription || "", published: !a.published }),
    });
    load();
  }

  return (
    <div className="fade-up mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Content</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">News Articles</h1>
        </div>
        <Button onClick={openCreate} className="btn-glow rounded-none bg-primary font-display text-xs font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> New Article
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading articles" />
        </div>
      ) : articles.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No articles yet. Create your first one!</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card clip-corner-sm">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative hidden h-14 w-24 shrink-0 overflow-hidden border border-border bg-secondary sm:block">
                {a.coverImage && <Image src={a.coverImage} alt="" fill unoptimized className="img-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/15 px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest text-primary">
                    {a.category}
                  </span>
                  {!a.published && (
                    <span className="border border-amber-500/40 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-amber-300">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  /news/{a.slug} · {formatDate(a.createdAt)} · {a.views} views
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => togglePublished(a)} title={a.published ? "Unpublish" : "Publish"}
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  {a.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(a)} title="Edit"
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(a.id)} title="Delete"
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">
              {editingId ? "Edit Article" : "New Article"}
            </DialogTitle>
            <DialogDescription>
              Markdown is supported in content (## headings, **bold**, lists, links).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article headline" className="h-11 rounded-none bg-background/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-11 w-full rounded-none bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ARTICLE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} id="published" />
                <Label htmlFor="published" className="text-sm text-muted-foreground">Published</Label>
              </div>
            </div>
            <UploadField label="Cover Image" value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })}
              hint="Recommended 1344×768" />
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Excerpt *</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2} placeholder="Short summary shown on cards and SEO" className="rounded-none bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Content *</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={12} placeholder="Full article body — Markdown supported" className="rounded-none bg-background/60 font-mono text-sm" />
            </div>
            <details className="border border-border p-3 clip-corner-sm">
              <summary className="cursor-pointer font-display text-xs uppercase tracking-widest text-muted-foreground">
                SEO options (optional)
              </summary>
              <div className="mt-3 space-y-3">
                <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="SEO title (defaults to article title)" className="h-10 rounded-none bg-background/60" />
                <Textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  rows={2} placeholder="SEO meta description (defaults to excerpt)" className="rounded-none bg-background/60" />
              </div>
            </details>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-none">Cancel</Button>
              <Button onClick={save} disabled={saving} className="btn-glow rounded-none bg-primary font-display uppercase tracking-widest text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Publish article"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
