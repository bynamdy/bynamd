"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Copy,
  Download,
  KeyRound,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "password" | "totp" | "setup";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isBackup, setIsBackup] = useState(false);
  const [qr, setQr] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function post(payload: Record<string, unknown>) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("password");
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { ok, data } = await post({ step: "credentials", email, password });
    setLoading(false);
    if (!ok) {
      setError(data.error || "Login failed.");
      return;
    }
    if (data.stage === "totp") setStep("totp");
    else if (data.stage === "setup") {
      setQr(data.qr);
      setManualSecret(data.manualSecret);
      setBackupCodes(data.backupCodes);
      setStep("setup");
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { ok, data } = await post({ step: "totp", code, isBackup });
    setLoading(false);
    if (!ok) {
      if (data.expired) {
        setStep("email");
        setPassword("");
        setCode("");
      }
      setError(data.error || "Verification failed.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  function downloadBackupCodes() {
    const text = [
      "BYNAMDY ADMIN — BACKUP RECOVERY CODES",
      "Each code works ONCE if you lose your authenticator app.",
      "Store this file somewhere safe and delete it from your downloads.",
      "",
      ...backupCodes,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bynamdy-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center bg-primary clip-corner-sm shadow-[0_0_24px_rgba(230,20,45,0.5)]">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" aria-hidden />
          </span>
          <h1 className="font-display text-2xl font-bold uppercase tracking-widest">
            By<span className="text-primary">namdy</span> Admin
          </h1>
        </div>

        <div className="border border-border bg-card p-7 clip-corner shadow-2xl">
          {/* progress indicator */}
          <div className="mb-6 flex items-center gap-2" aria-hidden>
            {["Email", "Password", "2FA"].map((label, i) => {
              const order: Step[] = ["email", "password", "totp", "setup"];
              const currentIdx = order.indexOf(step) >= 2 ? 2 : order.indexOf(step);
              const active = i <= currentIdx;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={`h-1 flex-1 rounded-full ${active ? "bg-primary shadow-[0_0_10px_rgba(230,20,45,0.7)]" : "bg-border"}`}
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 clip-corner-sm" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={submitEmail} className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">Sign in</h2>
                <p className="mt-1 text-xs text-muted-foreground">Restricted area — staff only.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="email" type="email" required autoFocus value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bynamdy.com"
                    className="h-12 rounded-none bg-background/60 pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="btn-glow h-12 w-full rounded-none bg-primary font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={submitPassword} className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">Password</h2>
                <p className="mt-1 text-xs text-muted-foreground">Signing in as {email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="password" type="password" required autoFocus value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-none bg-background/60 pl-10"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="btn-glow h-12 w-full rounded-none bg-primary font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          )}

          {step === "totp" && (
            <form onSubmit={submitCode} className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">Two-factor authentication</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isBackup
                    ? "Enter one of your backup recovery codes (works once)."
                    : "Open your authenticator app and enter the 6-digit code."}
                </p>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={code} onChange={(e) => setCode(e.target.value)} required autoFocus
                  placeholder={isBackup ? "XXXXX-XXXXX" : "123456"}
                  className="h-12 rounded-none bg-background/60 pl-10 font-mono text-lg tracking-widest"
                  autoCapitalize="characters"
                />
              </div>
              <Button type="submit" disabled={loading} className="btn-glow h-12 w-full rounded-none bg-primary font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & Sign In <ShieldCheck className="ml-2 h-4 w-4" /></>}
              </Button>
              <button
                type="button"
                onClick={() => { setIsBackup(!isBackup); setCode(""); setError(""); }}
                className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {isBackup ? "← Use authenticator code instead" : "Lost your phone? Use a backup code"}
              </button>
            </form>
          )}

          {step === "setup" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">Set up your authenticator</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  First login: scan this QR with Google Authenticator, Authy, 1Password or Microsoft Authenticator.
                </p>
              </div>

              {qr && (
                <div className="flex flex-col items-center gap-2">
                  <div className="qr-panel">
                    <Image src={qr} alt="2FA QR code" width={220} height={220} unoptimized />
                  </div>
                  {manualSecret && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(manualSecret).catch(() => {})}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                      title="Copy secret key for manual setup"
                    >
                      <Copy className="h-3 w-3" aria-hidden />
                      <span className="font-mono">{manualSecret.slice(0, 8)}…{manualSecret.slice(-4)}</span> (manual entry)
                    </button>
                  )}
                </div>
              )}

              <div className="border border-amber-500/40 bg-amber-500/10 p-4 clip-corner-sm">
                <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-amber-300">
                  <TriangleAlert className="h-4 w-4" aria-hidden /> Save your backup codes now
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Shown once only — each code works once if you lose your phone.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-xs text-foreground">
                  {backupCodes.map((c) => (
                    <span key={c} className="bg-background/70 px-2 py-1 text-center">{c}</span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={downloadBackupCodes}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                    <Download className="h-3.5 w-3.5" aria-hidden /> Download
                  </button>
                  <button type="button" onClick={() => navigator.clipboard.writeText(backupCodes.join("\n")).catch(() => {})}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy all
                  </button>
                </div>
              </div>

              <form onSubmit={submitCode} className="space-y-4">
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={code} onChange={(e) => setCode(e.target.value)} required
                    placeholder="Enter the 6-digit code from the app"
                    className="h-12 rounded-none bg-background/60 pl-10 font-mono tracking-widest"
                  />
                </div>
                <Button type="submit" disabled={loading} className="btn-glow h-12 w-full rounded-none bg-primary font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Confirm & Enable 2FA <CheckCircle2 className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">← Back to Bynamdy</Link>
        </p>
      </div>
    </div>
  );
}
