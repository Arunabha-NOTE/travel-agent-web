import { type NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

describe("proxy", () => {
  it("should redirect to home if no access token and route is protected", () => {
    const mockRequest = {
      nextUrl: { pathname: "/chat" },
      cookies: { get: jest.fn().mockReturnValue(undefined) },
      url: "http://localhost:3000/chat",
    } as unknown as NextRequest;

    proxy(mockRequest);
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("should redirect to chat if access token exists and route is auth", () => {
    const mockRequest = {
      nextUrl: { pathname: "/login" },
      cookies: { get: jest.fn().mockReturnValue({ value: "token" }) },
      url: "http://localhost:3000/login",
    } as unknown as NextRequest;

    proxy(mockRequest);
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("should continue if route is not protected and no token", () => {
    const mockRequest = {
      nextUrl: { pathname: "/" },
      cookies: { get: jest.fn().mockReturnValue(undefined) },
      url: "http://localhost:3000/",
    } as unknown as NextRequest;

    proxy(mockRequest);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
