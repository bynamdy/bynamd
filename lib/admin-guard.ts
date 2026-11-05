import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

/** Returns the admin row if a valid full session cookie is present, else null. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  try {
    const admin = await db.admin.findUnique({ where: { id: session.sub } });
    return admin;
  } catch {
    return null;
  }
}
