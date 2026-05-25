// src/lib/api.ts
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in_hours: number;
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  raw: unknown;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    raw: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.raw = raw;
  }
}

let globalErrorHandler: ((message: string) => void) | null = null;
let authFailureHandler: (() => void) | null = null;

export function registerGlobalApiErrorHandler(handler: (message: string) => void) {
  globalErrorHandler = handler;
}

export function registerAuthFailureHandler(handler: () => void) {
  authFailureHandler = handler;
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(data: TokenResponse) {
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
    return text;
  }
}

function extractErrorMessage(data: any, status: number): string {
  const detail = data?.detail;

  if (typeof detail === "string") return detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof detail?.message === "string") return detail.message;

  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item?.msg === "string") return item.msg;
        return null;
      })
      .filter(Boolean);

    if (msgs.length > 0) {
      return msgs.join(", ");
    }
  }

  return `Request failed (${status})`;
}

function extractFieldErrors(data: any): Record<string, string> {
  const explicitFieldErrors = data?.detail?.field_errors || data?.field_errors;

  if (
    explicitFieldErrors &&
    typeof explicitFieldErrors === "object" &&
    !Array.isArray(explicitFieldErrors)
  ) {
    return explicitFieldErrors;
  }

  const detail = data?.detail;

  if (Array.isArray(detail)) {
    const result: Record<string, string> = {};

    for (const item of detail) {
      const loc = Array.isArray(item?.loc) ? item.loc : [];
      const msg = typeof item?.msg === "string" ? item.msg : "Invalid value";

      const fieldName = loc.length > 0 ? String(loc[loc.length - 1]) : "form";

      if (!result[fieldName]) {
        result[fieldName] = msg;
      }
    }

    return result;
  }

  return {};
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
  const rt = getRefreshToken();

  if (!rt) {
    clearTokens();
    throw new Error("No refresh token");
  }

  const res = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    clearTokens();

    const message = extractErrorMessage(data, res.status);

    throw new ApiError(message, res.status, {}, data);
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

  console.log("apiFetch debug", {
    url,
    hasAccessToken: Boolean(token),
    hasRefreshToken: Boolean(getRefreshToken()),
  });

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  console.log("apiFetch response", {
    url,
    status: res.status,
  });

  if (res.status === 401 && retry && getRefreshToken()) {
    try {
      console.log("401 received, attempting token refresh");

      await ensureRefreshedOnce();

      console.log("Token refresh successful, retrying request");

      return apiFetch<T>(path, options, false);
    } catch (err) {
      console.error("Token refresh failed", err);

      authFailureHandler?.();
      throw err;
    }
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    console.error("apiFetch error response", {
      url,
      status: res.status,
      data,
    });

    const message = extractErrorMessage(data, res.status);
    const fieldErrors = extractFieldErrors(data);

    const error = new ApiError(message, res.status, fieldErrors, data);

    if (res.status !== 401) {
      globalErrorHandler?.(message);
    }

    throw error;
  }

  return data as T;
}