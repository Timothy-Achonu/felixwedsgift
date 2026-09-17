import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./admin-shell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import AdminPage from "./page";

describe("admin overview", () => {
  it("marks implemented modules as available and links to their pages", async () => {
    render(await AdminPage());

    expect(screen.getAllByText("Available now")).toHaveLength(3);
    expect(
      screen.getByText(
        "Your workspace is ready. Manage the wedding details and schedule here, including guest photo review and approval.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit wedding details" }),
    ).toHaveAttribute("href", "/admin/details");
    expect(screen.getByRole("link", { name: "Open schedule" })).toHaveAttribute(
      "href",
      "/admin/schedule",
    );

    const photoCard = screen.getByRole("heading", {
      name: "Photo moderation",
    }).parentElement;
    expect(photoCard).not.toBeNull();
    expect(
      within(photoCard as HTMLElement).getByText("Available now"),
    ).toBeInTheDocument();
    expect(
      within(photoCard as HTMLElement).getByRole("link", {
        name: "Review photographs",
      }),
    ).toHaveAttribute("href", "/admin/photos");
  });
});
