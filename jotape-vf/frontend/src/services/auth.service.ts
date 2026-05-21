/**
 * Placeholder for JWT auth (RF-01 / RF-02). Replace with real FastAPI calls.
 */
export const authService = {
  async login(_email: string, _password: string): Promise<{ token: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return { token: "demo-token" };
  },

  async register(_email: string, _password: string): Promise<{ ok: boolean }> {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  },

  async requestPasswordReset(_email: string): Promise<{ ok: boolean }> {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  },
};
