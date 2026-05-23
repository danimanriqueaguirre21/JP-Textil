import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await backendFetch("/auth/register", {
    method: "POST",
    body,
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
