import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: true, storage: "local-file" });
  }

  try {
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, storage: "postgres" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
