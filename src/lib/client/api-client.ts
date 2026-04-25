import axios from "axios";

import { clientEnv } from "@/config/env";

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // If baseURL is set (e.g., /api/proxy) and the url starts with a slash,
  // Axios will treat the url as absolute relative to the domain root
  // and ignore the path in baseURL. We fix this by stripping the leading slash
  // and ensuring baseURL ends with a slash so they concatenate properly.
  if (config.baseURL && config.url?.startsWith("/")) {
    config.url = config.url.substring(1);
    if (!config.baseURL.endsWith("/")) {
      config.baseURL += "/";
    }
  }
  return config;
});
