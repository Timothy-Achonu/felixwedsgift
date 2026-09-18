import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/wedding/site-header";

describe("site header", () => {
  it("keeps the studio shortcut private by default", () => {
    render(<SiteHeader />);

    expect(
      screen.queryByRole("link", { name: "Open wedding studio" }),
    ).not.toBeInTheDocument();
  });

  it("links verified admins to the dashboard", () => {
    render(<SiteHeader showAdminShortcut />);

    expect(
      screen.getByRole("link", { name: "Open wedding studio" }),
    ).toHaveAttribute("href", "/admin");
  });
});
