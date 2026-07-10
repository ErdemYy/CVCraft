import { cookies } from "next/headers";
import { getUserById, type AuthUser } from "./auth";

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cv_session");
  if (!sessionCookie?.value) return null;
  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    if (!data?.id) return null;
    return getUserById(data.id);
  } catch {
    return null;
  }
}

export function createSessionToken(user: AuthUser): string {
  return Buffer.from(JSON.stringify({ id: user.id })).toString("base64");
}
