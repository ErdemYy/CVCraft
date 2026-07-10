import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
    }

    const user = authenticate(username, password);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
    }

    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
    });

    response.cookies.set("cv_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
