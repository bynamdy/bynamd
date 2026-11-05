"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadField({
  label,
  value,
  onChange,
  aspect = "aspect-[16/9]",
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) onChange(data.url);
      else setError(data.error);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="flex gap-3">
        <div className={`${aspect} relative w-36 shrink-0 overflow-hidden border border-border bg-secondary clip-corner-sm`}>
          {value ? (
            <>
              <Image src={value} alt="Preview" fill unoptimized className="img-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/70 text-white hover:text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image URL… or upload a file"
            className="h-10 rounded-none bg-background/60 text-sm"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-display uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" aria-hidden />}
              Upload
            </button>
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
