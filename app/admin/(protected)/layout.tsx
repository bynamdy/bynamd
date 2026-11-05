import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Bynamdy",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let email = session.email;
  let unread = 0;
  try {
    const admin = await db.admin.findUnique({ where: { id: session.sub } });
    if (!admin) redirect("/admin/login");
    email = admin.email;
    unread = await db.contactMessage.count({ where: { read: false } });
  } catch {
    redirect("/admin/login");
  }

  return (
    <AdminShell email={email} unread={unread}>
      {children}
    </AdminShell>
  );
}
