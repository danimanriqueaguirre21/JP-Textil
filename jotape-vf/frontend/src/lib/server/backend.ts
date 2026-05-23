/** URL del API FastAPI para route handlers (servidor). */
export function getBackendUrl(): string {
  return (
    process.env.API_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000"
  );
}

export async function backendFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getBackendUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}
