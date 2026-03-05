export const authConfig = {
  accessTokenCookieName:
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE ?? "chatbot_access_token",
  protectedRoutePrefixes: ["/dashboard"],
  authRoutes: ["/login"],
};
