import axios from "axios";

import { authConfig } from "@/config/auth";
import { clientEnv } from "@/config/env";

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const cookieKey = `${authConfig.accessTokenCookieName}=`;
    const rawCookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(cookieKey));

    const token = rawCookie?.split("=").at(1);
    if (token) {
      config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
    }
  }

  return config;
});
