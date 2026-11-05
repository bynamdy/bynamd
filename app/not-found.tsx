import Link from "next/link";
import { Ghost, Home, Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Ghost className="h-14 w-14 text-primary" aria-hidden />
      <p className="mt-6 font-display text-7xl font-bold text-primary text-glow">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">
        Game Over — Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for has been patched out or never existed. Respawn below.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="btn-glow inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground clip-corner-sm"
        >
          <Home className="h-4 w-4" aria-hidden /> Back Home
        </Link>
        <Link
          href="/codes"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary clip-corner-sm"
        >
          <Gamepad2 className="h-4 w-4" aria-hidden /> Cheat Codes
        </Link>
      </div>
    </div>
  );
}
