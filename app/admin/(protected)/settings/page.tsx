"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, KeyRound, Mail, ShieldCheck, Download, Copy, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const [account, setAccount] = useState<{ email: string; twoFactorEnabled: boolean } | null>(null);
  const { toast } = useToast();

  // email form
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // backups
  const [regenPassword, setRegenPassword] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/admin/account")
      .then((r) => r.json())
      .then(setAccount);
  }, []);

  async function call(action: string, body: Record<string, unknown>) {
    setBusy(action);
    const res = await fetch("/api/admin/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await res.json();
    setBusy("");
    return { ok: res.ok, data };
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const { ok, data } = await call("email", { currentPassword: currentPasswordEmail, newEmail });
    if (ok) {
      setAccount({ ...account!, email: data.email });
      setNewEmail("");
      setCurrentPasswordEmail("");
      toast({ title: "Email updated", description: data.message });
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { ok, data } = await call("password", { currentPassword, newPassword, confirmPassword });
    if (ok) {
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: "Password updated", description: data.message });
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  async function regenCodes(e: React.FormEvent) {
    e.preventDefault();
    const { ok, data } = await call("regen_backup_codes", { currentPassword: regenPassword });
    if (ok) {
      setNewCodes(data.backupCodes);
      setRegenPassword("");
      toast({ title: "Backup codes regenerated", description: data.message });
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  if (!account)
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading settings" />
      </div>
    );

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-6">
      <div>
        <p className="kicker">Account</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Settings</h1>
      </div>

      {/* 2FA status */}
      <div className="flex items-center gap-3 border border-primary/40 bg-primary/10 p-4 clip-corner-sm">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide">Two-factor authentication</p>
          <p className="text-xs text-muted-foreground">
            {account.twoFactorEnabled
              ? "Enabled — an authenticator app code is required at every login. Backup codes below can rescue you."
              : "Pending — you'll be asked to scan a QR code on your next login."}
          </p>
        </div>
      </div>

      {/* change email */}
      <section className="border border-border bg-card p-5 clip-corner-sm">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
          <Mail className="h-4 w-4 text-primary" aria-hidden /> Change email
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Current: {account.email}</p>
        <form onSubmit={changeEmail} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newEmail" className="text-xs text-muted-foreground">New email</Label>
            <Input id="newEmail" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@email.com" className="h-10 rounded-none bg-background/60" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpw1" className="text-xs text-muted-foreground">Current password *</Label>
            <Input id="cpw1" type="password" required value={currentPasswordEmail} onChange={(e) => setCurrentPasswordEmail(e.target.value)}
              className="h-10 rounded-none bg-background/60" />
          </div>
          <Button type="submit" disabled={busy === "email"} className="rounded-none bg-primary font-display text-xs uppercase tracking-widest text-primary-foreground">
            {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update email"}
          </Button>
        </form>
      </section>

      {/* change password */}
      <section className="border border-border bg-card p-5 clip-corner-sm">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden /> Change password
        </h2>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cpw2" className="text-xs text-muted-foreground">Current password *</Label>
            <Input id="cpw2" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 rounded-none bg-background/60" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="npw" className="text-xs text-muted-foreground">New password (min 8 chars) *</Label>
              <Input id="npw" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-none bg-background/60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cpw3" className="text-xs text-muted-foreground">Confirm new password *</Label>
              <Input id="cpw3" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-none bg-background/60" />
            </div>
          </div>
          <Button type="submit" disabled={busy === "password"} className="rounded-none bg-primary font-display text-xs uppercase tracking-widest text-primary-foreground">
            {busy === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </section>

      {/* backup codes */}
      <section className="border border-border bg-card p-5 clip-corner-sm">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
          <TriangleAlert className="h-4 w-4 text-primary" aria-hidden /> Backup recovery codes
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          If you lose your phone, a backup code is the only way in. Regenerating invalidates all previous codes.
        </p>
        {newCodes && (
          <div className="mt-4 border border-amber-500/40 bg-amber-500/10 p-4 clip-corner-sm">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-amber-300">
              Save these now — shown once
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
              {newCodes.map((c) => <span key={c} className="bg-background/70 px-2 py-1 text-center">{c}</span>)}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button"
                onClick={() => {
                  const blob = new Blob(["BYNAMDY BACKUP CODES\n\n" + newCodes.join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "bynamdy-backup-codes.txt"; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                <Download className="h-3.5 w-3.5" aria-hidden /> Download
              </button>
              <button type="button" onClick={() => navigator.clipboard.writeText(newCodes.join("\n")).catch(() => {})}
                className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                <Copy className="h-3.5 w-3.5" aria-hidden /> Copy all
              </button>
            </div>
          </div>
        )}
        <form onSubmit={regenCodes} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rpw" className="text-xs text-muted-foreground">Current password *</Label>
            <Input id="rpw" type="password" required value={regenPassword} onChange={(e) => setRegenPassword(e.target.value)}
              className="h-10 max-w-xs rounded-none bg-background/60" />
          </div>
          <Button type="submit" disabled={busy === "regen_backup_codes"} variant="outline" className="rounded-none">
            {busy === "regen_backup_codes" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate new backup codes"}
          </Button>
        </form>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Save className="h-3.5 w-3.5" aria-hidden /> Changes apply immediately. You stay signed in on this device.
      </p>
    </div>
  );
}
