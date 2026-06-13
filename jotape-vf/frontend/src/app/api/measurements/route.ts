import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth-session";
import { backendFetch } from "@/lib/server/backend";

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** BFF: medidas corporales del usuario autenticado. */
export async function GET() {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    return NextResponse.json(
      { error: { message: "Sesión requerida" } },
      { status: 401 },
    );
  }

  const upstream = await backendFetch("/users/me/measurements/current", {
    headers,
  });

  if (upstream.status === 404) {
    return NextResponse.json(null, { status: 404 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(request: Request) {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    return NextResponse.json(
      { error: { message: "Sesión requerida" } },
      { status: 401 },
    );
  }

  const body = await request.text();
  const upstream = await backendFetch("/users/me/measurements", {
    method: "POST",
    body,
    headers,
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
