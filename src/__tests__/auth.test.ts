// Since it's a Server Action, we mock fetch and cookies
const mockSet = jest.fn();
const mockDelete = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => ({
    set: mockSet,
    delete: mockDelete,
    get: jest.fn(),
  }),
}));

global.fetch = jest.fn() as jest.Mock;

import { loginAction } from "@/app/actions/auth.actions";

describe("auth.actions", () => {
  it("should securely set HttpOnly cookies on successful login", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user_id: 1,
        access_token: "mock-access",
        refresh_token: "mock-refresh",
      }),
    });

    const result = await loginAction({
      email: "test@example.com",
      password: "password",
    });

    expect(result.user_id).toBe(1);
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(
      "chatbot_access_token",
      "mock-access",
      expect.objectContaining({ httpOnly: true, path: "/" }),
    );
  });
});
