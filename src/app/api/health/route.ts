import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Health check proxy error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
