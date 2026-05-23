import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "@/lib/auth-session";
import { backendFetch } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await backendFetch("/auth/login", {
    method: "POST",
    body,
  });
  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const token = (data as { access_token?: string }).access_token;
  if (!token) {
    return NextResponse.json({ error: { message: "Respuesta inválida" } }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
