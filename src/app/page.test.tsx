import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("home page", () => {
  it("renders the complete public wedding structure", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { name: "Felix & Gift" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Our story" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Meet us in Lagos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A day made for remembering" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Add your moments to ours." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Love, held in a frame." }),
    ).toBeInTheDocument();
  });
});
