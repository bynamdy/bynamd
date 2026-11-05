"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, MailOpen, Mail, ChevronDown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type Message = {
  id: string; name: string; email: string; subject: string | null;
  message: string; read: boolean; createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/messages");
    if (res.ok) setMessages((await res.json()).messages);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(m: Message) {
    await fetch(`/api/admin/messages/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !m.read }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    load();
  }

  function toggleOpen(m: Message) {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.read) toggleRead(m);
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="fade-up mx-auto max-w-4xl space-y-6">
      <div>
        <p className="kicker">Inbox</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">Contact Messages</h1>
        {unread > 0 && (
          <p className="mt-2 text-sm text-primary">{unread} unread message{unread === 1 ? "" : "s"}</p>
        )}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading messages" />
        </div>
      ) : messages.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center clip-corner-sm">
          <p className="text-sm text-muted-foreground">No messages yet. Form submissions will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card clip-corner-sm">
          {messages.map((m) => (
            <li key={m.id} className={cn(!m.read && "bg-primary/5")}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button onClick={() => toggleRead(m)} title={m.read ? "Mark unread" : "Mark read"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary clip-corner-sm">
                  {m.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-primary" />}
                </button>
                <button onClick={() => toggleOpen(m)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {m.subject || "No subject"}
                    {!m.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary live-dot" aria-label="unread" />}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.name} &lt;{m.email}&gt; · {formatDate(m.createdAt)}
                  </p>
                </button>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", openId === m.id && "rotate-180")} aria-hidden />
                <button onClick={() => remove(m.id)} title="Delete"
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400 clip-corner-sm">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {openId === m.id && (
                <div className="border-t border-border bg-background/40 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your message")}`}
                    className="mt-4 inline-block text-xs font-display uppercase tracking-widest text-primary hover:underline">
                    Reply by email →
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
