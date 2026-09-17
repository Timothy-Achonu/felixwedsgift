import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" }),
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("../admin-shell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("./photo-moderation", () => ({
  PhotoModeration: () => <p>Photo moderation</p>,
}));

import PhotosPage from "./page";

describe("photo moderation filters", () => {
  it("gives the active filter readable text and current-page semantics", async () => {
    const query = {
      select: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      returns: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.returns.mockResolvedValue({ data: [], error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    render(
      await PhotosPage({ searchParams: Promise.resolve({ status: "ALL" }) }),
    );

    const activeFilter = screen.getByRole("link", { name: "all" });
    expect(activeFilter).toHaveAttribute("aria-current", "page");
    expect(activeFilter).toHaveClass("!text-wedding-cream");
    expect(activeFilter).toHaveClass("!bg-wedding-navy");
  });
});
