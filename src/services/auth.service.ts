// src/services/auth.service.ts
import { apiFetch, clearTokens, setTokens, TokenResponse } from "@/lib/api";

export type MeResponse = {
  id: string;
  name?: string;
  email?: string;
};

export async function login(email: string, password: string) {
  const data = await apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setTokens(data);
  return data;
}

export async function register(email: string, password: string) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return apiFetch<MeResponse>("/api/auth/me", {
    method: "GET",
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}