// src/lib/api.ts
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in_hours: number;
};

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(data: TokenResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_in", String(data.expires_in_hours));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_in");
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // sometimes servers return plain text
  }
}

// Prevent multiple simultaneous refresh calls
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) throw new Error("No refresh token");

  const res = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    clearTokens();
    const message =
      (data as any)?.detail || (data as any)?.message || "Refresh failed";
    throw new Error(message);
  }

  setTokens(data as TokenResponse);
}

async function ensureRefreshedOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  // Build headers safely (options.headers may be Headers, array tuples, or object)
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, attempt refresh once and retry
  if (res.status === 401 && retry) {
    await ensureRefreshedOnce();
    return apiFetch<T>(path, options, false);
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      (data as any)?.detail ||
      (data as any)?.message ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}