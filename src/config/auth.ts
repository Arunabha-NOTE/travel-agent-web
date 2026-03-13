export const authConfig = {
  accessTokenCookieName:
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE ?? "chatbot_access_token",
  refreshTokenCookieName:
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE ?? "chatbot_refresh_token",
  protectedRoutePrefixes: ["/dashboard", "/chat", "/profile"],
  authRoutes: ["/login", "/forgot-password"],
};
