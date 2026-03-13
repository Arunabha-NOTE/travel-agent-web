export const queryKeys = {
  auth: {
    login: ["auth", "login"] as const,
    logout: ["auth", "logout"] as const,
    register: ["auth", "register"] as const,
    forgotPassword: ["auth", "forgot-password"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
    resetPassword: ["profile", "reset-password"] as const,
  },
  chat: {
    list: ["chat", "list"] as const,
    detail: (chatId?: number) => ["chat", "detail", chatId] as const,
    create: ["chat", "create"] as const,
    rename: ["chat", "rename"] as const,
    delete: ["chat", "delete"] as const,
  },
  system: {
    health: ["system", "health"] as const,
  },
};
