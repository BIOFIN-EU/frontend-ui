// src/services/auth.service.ts
import { apiFetch, clearTokens } from "@/lib/api";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in_hours: number;
};

export type MeResponse = {
  id?: string;
  name?: string;
  email?: string;
};

function setTokens(data: TokenResponse) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_in", String(data.expires_in_hours));
}

export async function login(email: string, password: string) {
  const data = await apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setTokens(data);
  return data;
}

export async function register(email: string, password: string) {
  // adjust body fields if your backend expects different keys
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return apiFetch<MeResponse>("/api/auth/me", { method: "GET" });
}

export function logout() {
  clearTokens();
}