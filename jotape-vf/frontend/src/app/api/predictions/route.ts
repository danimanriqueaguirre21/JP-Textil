import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth-session";
import { backendFetch } from "@/lib/server/backend";

/** BFF: reenvía predicción de talla al FastAPI sin exponer la URL del API al navegador. */
export async function POST(request: Request) {
  const body = await request.text();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const upstream = await backendFetch("/api/v1/predictions/", {
    method: "POST",
    body,
    headers,
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
