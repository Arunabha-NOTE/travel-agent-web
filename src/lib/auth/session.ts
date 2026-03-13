"use client";

import Cookies from "js-cookie";

import { authConfig } from "@/config/auth";

const ACCESS_TOKEN_MAX_AGE_DAYS = 1;
const REFRESH_TOKEN_MAX_AGE_DAYS = 30;

export function getAccessToken(): string | undefined {
  return Cookies.get(authConfig.accessTokenCookieName);
}

export function setAccessToken(token: string): void {
  Cookies.set(authConfig.accessTokenCookieName, token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: ACCESS_TOKEN_MAX_AGE_DAYS,
  });
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(authConfig.refreshTokenCookieName);
}

export function setRefreshToken(token: string): void {
  Cookies.set(authConfig.refreshTokenCookieName, token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: REFRESH_TOKEN_MAX_AGE_DAYS,
  });
}

export function clearAccessToken(): void {
  Cookies.remove(authConfig.accessTokenCookieName);
}

export function clearRefreshToken(): void {
  Cookies.remove(authConfig.refreshTokenCookieName);
}

export function clearAuthSession(): void {
  clearAccessToken();
  clearRefreshToken();
}
