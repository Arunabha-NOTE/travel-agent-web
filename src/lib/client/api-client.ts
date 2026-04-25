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
