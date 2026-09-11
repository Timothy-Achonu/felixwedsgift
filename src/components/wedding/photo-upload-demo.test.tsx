import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoUploadDemo } from "@/components/wedding/photo-upload-demo";

describe("photo upload prototype", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:photo-preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("previews and removes a supported photo locally", () => {
    render(<PhotoUploadDemo />);
    const file = new File(["photo"], "moment.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });

    expect(screen.getByAltText("Preview of moment.jpg")).toBeInTheDocument();
    expect(screen.getByText(/photos stay on this device/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove moment.jpg" }));
    expect(
      screen.queryByAltText("Preview of moment.jpg"),
    ).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-preview");
  });

  it("rejects unsupported file types", () => {
    render(<PhotoUploadDemo />);
    const file = new File(["notes"], "notes.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose JPEG, PNG, or WebP photos only.",
    );
  });

  it("completes the honest simulated progress flow", async () => {
    vi.useFakeTimers();
    render(<PhotoUploadDemo />);
    const file = new File(["photo"], "moment.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview upload" }));

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.getByRole("status")).toHaveTextContent("Preview complete");
    expect(screen.getByText(/no files left your device/i)).toBeInTheDocument();
  });
});
