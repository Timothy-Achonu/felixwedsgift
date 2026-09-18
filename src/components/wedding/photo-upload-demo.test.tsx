import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoUploadDemo } from "@/components/wedding/photo-upload-demo";

let uploadUrl = "";
let uploadBody: FormData | null = null;

class SuccessfulUploadRequest {
  status = 200;
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;

  open(_method: string, url: string) {
    uploadUrl = url;
  }

  send(body: FormData) {
    uploadBody = body;
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded: 1,
      total: 1,
    } as ProgressEvent);
    this.onload?.();
  }
}

class PendingUploadRequest {
  status = 0;
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;

  open() {}

  send() {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded: 1,
      total: 2,
    } as ProgressEvent);
  }
}

describe("guest photo upload", () => {
  beforeEach(() => {
    uploadUrl = "";
    uploadBody = null;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:photo-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 1600,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalHeight", {
      configurable: true,
      get: () => 1200,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("previews and removes a supported photo locally", async () => {
    render(<PhotoUploadDemo />);
    const file = new File(["photo"], "moment.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByAltText("Preview of moment.jpg"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/approved photos may appear publicly/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove moment.jpg" }));
    expect(
      screen.queryByAltText("Preview of moment.jpg"),
    ).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-preview");
  });

  it("rejects unsupported file types", async () => {
    render(<PhotoUploadDemo />);
    const file = new File(["notes"], "notes.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "notes.txt is not a JPEG, PNG, or WebP photo.",
    );
  });

  it("uploads and submits a photo for admin review", async () => {
    vi.stubGlobal("XMLHttpRequest", SuccessfulUploadRequest);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              uploads: [
                {
                  id: "00000000-0000-4000-8000-000000000001",
                  cloudName: "wedding-cloud",
                  apiKey: "key",
                  overwrite: false,
                  public_id: "wedding/guest/photo",
                  timestamp: 1,
                  signature: "signature",
                  type: "authenticated",
                },
              ],
            }),
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              results: [
                { id: "00000000-0000-4000-8000-000000000001", ok: true },
              ],
            }),
          ),
        ),
    );
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001");
    render(<PhotoUploadDemo />);
    const file = new File(["photo"], "moment.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: { files: [file] },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Share photos for review" }),
    );

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Photos received",
    );
    expect(screen.getByRole("dialog").tagName).not.toBe("DIALOG");
    expect(screen.getByText(/waiting for review/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share more photos" }),
    ).toBeInTheDocument();
    expect(uploadUrl).toBe(
      "https://api.cloudinary.com/v1_1/wedding-cloud/image/upload",
    );
    expect(uploadBody?.get("type")).toBe("authenticated");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByAltText("Preview of moment.jpg"),
    ).not.toBeInTheDocument();
  });

  it("minimizes and restores live upload progress", async () => {
    vi.stubGlobal("XMLHttpRequest", PendingUploadRequest);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        Response.json({
          uploads: [
            {
              id: "00000000-0000-4000-8000-000000000001",
              cloudName: "wedding-cloud",
              apiKey: "key",
              overwrite: false,
              public_id: "wedding/guest/photo",
              timestamp: 1,
              signature: "signature",
              type: "authenticated",
            },
          ],
        }),
      ),
    );
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001");
    render(<PhotoUploadDemo />);

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: {
        files: [new File(["photo"], "moment.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Share photos for review" }),
    );

    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Minimize upload progress" }),
    );
    expect(
      screen.getByRole("button", { name: /Expand upload progress/ }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Expand upload progress/ }),
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows a centered dialog on desktop after a successful upload", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("min-width: 640px"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal("XMLHttpRequest", SuccessfulUploadRequest);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              uploads: [
                {
                  id: "00000000-0000-4000-8000-000000000001",
                  cloudName: "wedding-cloud",
                  apiKey: "key",
                  overwrite: false,
                  public_id: "wedding/guest/photo",
                  timestamp: 1,
                  signature: "signature",
                  type: "authenticated",
                },
              ],
            }),
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              results: [
                { id: "00000000-0000-4000-8000-000000000001", ok: true },
              ],
            }),
          ),
        ),
    );
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001");
    render(<PhotoUploadDemo />);
    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: {
        files: [new File(["photo"], "moment.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Share photos for review" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveClass("h-dvh", "open:items-center");
    expect(dialog).toHaveTextContent("Photos received");
    expect(
      screen.getByRole("button", { name: "Share more photos" }),
    ).toBeInTheDocument();

    const closeButton = screen.getByRole("button", {
      name: "Close photo upload success dialog",
    });
    expect(closeButton).toHaveClass(
      "-top-14",
      "-right-14",
      "text-wedding-cream",
    );
    expect(closeButton).not.toHaveClass("bg-wedding-cream");

    fireEvent.click(closeButton);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByAltText("Preview of moment.jpg"),
    ).not.toBeInTheDocument();
  });

  it("keeps a failed finalization available for retry", async () => {
    vi.stubGlobal("XMLHttpRequest", SuccessfulUploadRequest);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            uploads: [
              {
                id: "00000000-0000-4000-8000-000000000001",
                cloudName: "wedding-cloud",
                apiKey: "key",
                overwrite: false,
                public_id: "wedding/guest/photo",
                timestamp: 1,
                signature: "signature",
                type: "authenticated",
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          Response.json(
            {
              results: [
                {
                  id: "00000000-0000-4000-8000-000000000001",
                  ok: false,
                },
              ],
            },
            { status: 207 },
          ),
        ),
    );
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001");
    render(<PhotoUploadDemo />);

    fireEvent.change(screen.getByLabelText("Choose photos"), {
      target: {
        files: [new File(["photo"], "moment.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Share photos for review" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Some photos could not be sent. Retry the failed photos.",
    );
    expect(
      screen.getByRole("button", { name: "Retry failed photos" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
