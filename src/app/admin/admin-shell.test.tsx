import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, logout } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
  requireAdmin,
}));

vi.mock("./actions", () => ({
  logout,
}));

import { AdminShell } from "./admin-shell";

describe("admin shell", () => {
  beforeEach(() => {
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
  });

  it("keeps the brand, account controls, and active navigation in the sidebar", async () => {
    render(
      await AdminShell({
        activeSection: "details",
        children: <section>Page content</section>,
      }),
    );

    const navigation = screen.getByRole("complementary", {
      name: "Admin navigation",
    });

    expect(
      within(navigation).getByRole("link", { name: "Admin overview" }),
    ).toHaveAttribute("href", "/admin");
    expect(
      within(navigation).getByRole("link", { name: "Wedding details" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByText("admin@example.com"),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole("link", { name: /Public website/ }),
    ).toHaveAttribute("href", "/");
  });
});
