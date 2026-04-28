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

  // Detect trailing slash to prevent unnecessary redirects
  const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");

  // Construct the backend URL (Prepending /api/v1 since this proxy is mounted at /api/v1)
  const url = new URL(
    `${backendUrl}/api/v1/${path}${hasTrailingSlash && path ? "/" : ""}`,
  );
  url.search = request.nextUrl.search;

  // Forward all headers except host and accept-encoding
  const headers = new Headers(request.headers);
  const originalHost = headers.get("host") || request.nextUrl.host;
  headers.delete("host");
  headers.delete("accept-encoding");

  // Inject standard proxy headers to help the backend generate correct URLs/redirects
  headers.set("X-Forwarded-Host", originalHost);
  headers.set("X-Forwarded-Proto", "https");
  headers.set("X-Forwarded-For", request.headers.get("x-forwarded-for") || "");

  // Read the HttpOnly cookie and inject it as a Bearer token
  const cookieStore = await cookies();
  const token = cookieStore.get(
    clientEnv.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE,
  )?.value;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Pre-read the body as an ArrayBuffer to allow reuse if we need to follow redirects
  // This is necessary because request.body is a stream and can only be consumed once.
  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  // Forward the request
  try {
    let response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      // We handle redirects manually to ensure Authorization headers are preserved
      // when the backend redirects (e.g., from http to https or slash adjustments).
      redirect: "manual",
      // disable cache to ensure fresh data
      cache: "no-store",
    });

    // Follow internal redirects (like trailing slash adjustments or http -> https) manually.
    // Native fetch() drops Authorization headers on protocol downgrades or cross-origin redirects.
    let redirectCount = 0;
    while (
      (response.status === 301 ||
        response.status === 302 ||
        response.status === 307 ||
        response.status === 308) &&
      redirectCount < 3
    ) {
      const location = response.headers.get("location");
      if (!location) break;

      const locationUrl = new URL(location, url.toString());
      const backendHostname = new URL(backendUrl).hostname;

      // Only follow if it's still pointing to our backend
      if (locationUrl.hostname === backendHostname) {
        redirectCount++;
        response = await fetch(locationUrl.toString(), {
          method: request.method,
          headers,
          body,
          redirect: "manual",
          cache: "no-store",
        });
      } else {
        // External redirect, let the browser handle it
        break;
      }
    }

    // Forward the response back to the client
    const responseHeaders = new Headers(response.headers);
    // Remove Set-Cookie from proxied responses to prevent cross-domain pollution
    responseHeaders.delete("set-cookie");

    // Remove compression headers to let Next.js handle encoding
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // Rewrite Location header for any remaining redirects (e.g., external ones)
    const location = responseHeaders.get("location");
    if (location) {
      try {
        const locationUrl = new URL(location, backendUrl);
        const backendHostname = new URL(backendUrl).hostname;

        if (locationUrl.hostname === backendHostname) {
          responseHeaders.set(
            "location",
            locationUrl.pathname + locationUrl.search,
          );
        }
      } catch (error) {
        // Skip parsing if Location header is invalid
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
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
