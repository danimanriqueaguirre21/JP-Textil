import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth-session";
import { backendFetch } from "@/lib/server/backend";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sin sesión" } },
      { status: 401 },
    );
  }

  try {
    const upstream = await backendFetch("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "backend_unavailable",
          message: "API no disponible. Inicia el backend en el puerto 8000.",
        },
      },
      { status: 503 },
    );
  }
}
