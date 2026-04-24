"use server";

import { cookies } from "next/headers";
import { clientEnv } from "@/config/env";
import type { LoginRequest, RegisterRequest } from "@/lib/types";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

export async function loginAction(payload: LoginRequest) {
  const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Login failed");
  }

  const cookieStore = await cookies();

  // Set access token securely
  cookieStore.set(
    clientEnv.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE,
    data.access_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    },
  );

  // Set refresh token securely
  cookieStore.set("chatbot_refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { user_id: data.user_id };
}

export async function registerAction(payload: RegisterRequest) {
  const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Registration failed");
  }

  const cookieStore = await cookies();

  cookieStore.set(
    clientEnv.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE,
    data.access_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    },
  );

  cookieStore.set("chatbot_refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { user_id: data.user_id };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("chatbot_refresh_token")?.value;

  if (refreshToken) {
    // Optionally notify the backend to revoke the refresh token
    await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    }).catch(console.error);
  }

  cookieStore.delete(clientEnv.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE);
  cookieStore.delete("chatbot_refresh_token");
}
