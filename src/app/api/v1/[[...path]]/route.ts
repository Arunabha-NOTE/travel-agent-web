import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { clientEnv } from "@/config/env";

export async function ANY(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const p = await params;
  const pathArray = p.path || [];
  const path = pathArray.join("/");

  // Construct the backend URL (Prepending /api/v1 since this proxy is mounted at /api/v1)
  const url = new URL(`${backendUrl}/api/v1/${path}`);
  url.search = request.nextUrl.search;

  // Forward all headers except host
  const headers = new Headers(request.headers);
  headers.delete("host");

  // Read the HttpOnly cookie and inject it as a Bearer token
  const cookieStore = await cookies();
  const token = cookieStore.get(
    clientEnv.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE,
  )?.value;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Forward the request
  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? await request.arrayBuffer()
          : undefined,
      redirect: "manual",
      // disable cache to ensure fresh data
      cache: "no-store",
    });

    // Forward the response back to the client
    const responseHeaders = new Headers(response.headers);
    // Remove Set-Cookie from proxied responses to prevent cross-domain pollution
    responseHeaders.delete("set-cookie");

    // Rewrite Location header to prevent redirects bypassing the proxy
    const location = responseHeaders.get("location");
    if (location) {
      if (location.startsWith(backendUrl)) {
        responseHeaders.set(
          "location",
          location.replace(backendUrl, request.nextUrl.origin),
        );
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Proxy Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Export specific HTTP methods as required by Next.js App Router
export const GET = ANY;
export const POST = ANY;
export const PUT = ANY;
export const PATCH = ANY;
export const DELETE = ANY;
export const OPTIONS = ANY;
export const HEAD = ANY;
