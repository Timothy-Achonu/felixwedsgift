import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" }),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("../admin-shell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("./photo-moderation-content", () => ({
  PhotoModerationContent: ({ initialStatus }: { initialStatus: string }) => (
    <p>Photo status: {initialStatus}</p>
  ),
}));

import PhotosPage from "./page";

describe("photo moderation route state", () => {
  it("normalizes a valid requested status for the client query view", async () => {
    render(
      await PhotosPage({ searchParams: Promise.resolve({ status: "ALL" }) }),
    );

    expect(screen.getByText("Photo status: ALL")).toBeInTheDocument();
  });

  it("defaults invalid statuses to pending", async () => {
    render(
      await PhotosPage({
        searchParams: Promise.resolve({ status: "not-a-status" }),
      }),
    );

    expect(screen.getByText("Photo status: PENDING")).toBeInTheDocument();
  });
});
