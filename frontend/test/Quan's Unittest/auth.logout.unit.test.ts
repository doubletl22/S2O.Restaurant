import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../lib/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

import http from "../../lib/http";
import { authService } from "../../services/auth.service";

describe("authService.logout", () => {
  const cookieWrites: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    cookieWrites.length = 0;

    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: (value: string) => {
        cookieWrites.push(value);
      },
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/owner/dashboard" },
      writable: true,
    });
  });

  it("UTC201 - should clear storage, clear auth cookies, and redirect when server logout succeeds", async () => {
    vi.mocked(http.post).mockResolvedValue({});
    localStorage.setItem("accessToken", "valid.jwt.token");
    localStorage.setItem("user", JSON.stringify({ id: "u1" }));

    await authService.logout();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenCalledWith("/api/v1/auth/logout");
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(cookieWrites.length).toBe(5);
    expect(window.location.href).toBe("/login?logged_out=true");
  });

  it("UTC202 - should still logout client-side even when server logout fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.mocked(http.post).mockRejectedValue(new Error("network error"));
    localStorage.setItem("accessToken", "valid.jwt.token");
    localStorage.setItem("user", JSON.stringify({ id: "u1" }));

    await authService.logout();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(cookieWrites.length).toBe(5);
    expect(window.location.href).toBe("/login?logged_out=true");
  });

  it("UTC203 - should not throw when localStorage keys are missing", async () => {
    vi.mocked(http.post).mockResolvedValue({});

    await expect(authService.logout()).resolves.toBeUndefined();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login?logged_out=true");
  });

  it("UTC204 - should clear all expected auth cookie keys", async () => {
    vi.mocked(http.post).mockResolvedValue({});

    await authService.logout();

    const joined = cookieWrites.join("\n");
    expect(joined).toContain("token=");
    expect(joined).toContain("role=");
    expect(joined).toContain("s2o_auth_token=");
    expect(joined).toContain("auth_token=");
    expect(joined).toContain("user_role=");
  });

  it("UTC205 - should call logout endpoint exactly once", async () => {
    vi.mocked(http.post).mockResolvedValue({});

    await authService.logout();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.post).toHaveBeenNthCalledWith(1, "/api/v1/auth/logout");
  });
});
