// src/services/auth.service.ts
import {
  apiFetch,
  clearTokens,
  getRefreshToken,
  setTokens,
} from "@/lib/api";
import type { MeResponse, TokenResponse } from "@/types/auth";

const BASE = "/api/auth";


export async function login(email: string, password: string) {
  const data = await apiFetch<TokenResponse>(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setTokens(data);
  return data;
}

export async function register(email: string, password: string) {
  return apiFetch(`${BASE}/register`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  // Silent: a failed session check means "logged out", which the auth
  // context handles; it isn't an error to show the user.
  return apiFetch<MeResponse>(`${BASE}/me`, {
    method: "GET",
    silent: true,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch(`${BASE}/change-password`, {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function closeAccount() {
  return apiFetch(`${BASE}/close-account`, {
    method: "POST",
  });
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await apiFetch(`${BASE}/logout`, {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } finally {
    clearTokens();
  }
}