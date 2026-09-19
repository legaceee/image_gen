import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Get current user session on server. Returns null if unauthenticated. */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Get current user ID. Throws if unauthenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}