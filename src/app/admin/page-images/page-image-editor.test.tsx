import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockWeddingContent } from "@/data/mock-wedding";
import type { PageImageRow } from "@/data/page-images";

import { PageImageEditor } from "./page-image-editor";

const saved: PageImageRow = {
  slot: "hero_desktop",
  cloudinary_public_id: "wedding/page/12345678-1234-1234-1234-123456789abc",
  secure_url: "https://res.cloudinary.com/example/image/upload/v1/hero.jpg",
  alt: "The couple together",
  width: 4000,
  height: 3000,
  focal_x: 0.5,
  focal_y: 0.5,
};

function renderEditor(image: PageImageRow | null = null) {
  render(
    <PageImageEditor
      entries={[
        {
          slot: "hero_desktop",
          image,
          fallback: mockWeddingContent.hero.image,
        },
      ]}
    />,
  );
}

function selectPhoto() {
  const file = new File(["original photograph bytes"], "original.jpg", {
    type: "image/jpeg",
  });
  fireEvent.change(screen.getByLabelText("Photograph"), {
    target: { files: [file] },
  });
  fireEvent.change(screen.getByLabelText("Image description"), {
    target: { value: saved.alt },
  });
  return file;
}

function uploadResponses() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      Response.json({
        cloudName: "example",
        apiKey: "key",
        overwrite: "false",
        public_id: saved.cloudinary_public_id,
        timestamp: "1",
        signature: "signature",
      }),
    )
    .mockResolvedValueOnce(
      Response.json({ public_id: saved.cloudinary_public_id }),
    );
}

describe("original-preserving page image editor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class {
        src = "";
        naturalWidth = 4000;
        naturalHeight = 3000;
        decode = async () => {};
      },
    );
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = vi.fn(() => "blob:photo");
        static revokeObjectURL = vi.fn();
      },
    );
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uploads the original file bytes and dimensions without a canvas export", async () => {
    const request = uploadResponses().mockResolvedValueOnce(
      Response.json({ image: saved }),
    );
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, "toBlob");
    renderEditor();
    const original = selectPhoto();
    fireEvent.click(
      screen.getByRole("button", { name: "Save Hero - desktop" }),
    );
    await screen.findByText(/Image saved/);
    const body = request.mock.calls[1][1]?.body as FormData;
    const uploaded = body.get("file") as File;
    expect(uploaded.name).toBe(original.name);
    expect(uploaded.size).toBe(original.size);
    expect(uploaded.type).toBe(original.type);
    const bytes = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(uploaded);
    });
    expect(bytes).toBe("original photograph bytes");
    expect(canvas).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("saves new framing against the existing original without re-uploading", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ image: { ...saved, focal_x: 0.8 } }));
    renderEditor(saved);
    fireEvent.change(
      screen.getByRole("slider", { name: /Horizontal position/ }),
      { target: { value: "80" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save Hero - desktop" }),
    );
    await screen.findByText(/Image saved/);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe("/api/admin/page-images");
    expect(JSON.parse(request.mock.calls[0][1]?.body as string)).toMatchObject({
      publicId: saved.cloudinary_public_id,
      expectedPublicId: saved.cloudinary_public_id,
      focalX: 0.8,
    });
    expect(screen.getByRole("img")).toHaveAttribute("src", saved.secure_url);
  });

  it("requests compensating cleanup when the upload succeeds but saving fails", async () => {
    const request = uploadResponses()
      .mockResolvedValueOnce(
        Response.json(
          { error: "Another editor saved first." },
          { status: 409 },
        ),
      )
      .mockResolvedValueOnce(Response.json({ removed: true }));
    renderEditor();
    selectPhoto();
    fireEvent.click(
      screen.getByRole("button", { name: "Save Hero - desktop" }),
    );
    await screen.findByText("Another editor saved first.");
    await waitFor(() => expect(request).toHaveBeenCalledTimes(4));
    expect(request.mock.calls[3][1]).toMatchObject({
      method: "DELETE",
      body: JSON.stringify({ publicId: saved.cloudinary_public_id }),
    });
    expect(screen.queryByText(/Image saved/)).not.toBeInTheDocument();
  });

  it("rejects a source that would need enlargement before requesting a signature", async () => {
    vi.stubGlobal(
      "Image",
      class {
        src = "";
        naturalWidth = 1200;
        naturalHeight = 800;
        decode = async () => {};
      },
    );
    const request = vi.spyOn(globalThis, "fetch");
    renderEditor();
    selectPhoto();
    fireEvent.click(
      screen.getByRole("button", { name: "Save Hero - desktop" }),
    );
    await screen.findByText(/Choose a larger photo/);
    expect(request).not.toHaveBeenCalled();
  });
});
