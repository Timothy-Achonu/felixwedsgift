import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("home page", () => {
  it("renders the wedding identity", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Felix & Gift" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Our celebration is taking shape."),
    ).toBeInTheDocument();
  });
});
