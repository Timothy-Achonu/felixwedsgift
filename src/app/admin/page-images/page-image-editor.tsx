"use client";

import { useEffect, useState } from "react";

import type { PageImageRow, PageImageSlot } from "@/data/page-images";
import type { WeddingPhoto } from "@/types/wedding";

import { adminStyles } from "../admin-styles";
import { cropHeroFile, heroCropSizes } from "./crop";

type Entry = {
  slot: PageImageSlot;
  image: PageImageRow | null;
  fallback: WeddingPhoto;
};

type SelectedFile = { file: File; url: string };

const labels: Record<PageImageSlot, { title: string; advice: string }> = {
  hero_desktop: {
    title: "Hero - desktop",
    advice:
      "Frame a wide 16:9 composition. The finished crop is 1600 x 900 pixels.",
  },
  hero_mobile: {
    title: "Hero - phone",
    advice:
      "Frame a tall 9:16 composition. Use the desktop source or select a different photo.",
  },
  story_primary: {
    title: "Story - main portrait",
    advice:
      "Choose the photograph and position its focal point in the portrait preview.",
  },
  story_inset: {
    title: "Story - inset photograph",
    advice: "Check the smaller 4:3 placement, especially on narrow screens.",
  },
  venue: {
    title: "Venue photograph",
    advice:
      "Preview the wide placement and keep the important details near the focal point.",
  },
};

const previewFrames: Record<PageImageSlot, string> = {
  hero_desktop: "aspect-video",
  hero_mobile: "aspect-9/16 max-w-72",
  story_primary: "aspect-4/5 max-w-96",
  story_inset: "aspect-4/3 max-w-96",
  venue: "aspect-[8/5]",
};

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maximumFileSize = 20 * 1024 * 1024;

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  overwrite: string;
  public_id: string;
  timestamp: string;
  signature: string;
};

async function responseJson(
  response: Response,
): Promise<Record<string, unknown>> {
  const result: unknown = await response.json();
  return result && typeof result === "object"
    ? (result as Record<string, unknown>)
    : {};
}

async function uploadFile(file: File | Blob): Promise<string> {
  const signResponse = await fetch("/api/admin/page-images/sign", {
    method: "POST",
  });
  const signing = await responseJson(signResponse);
  if (!signResponse.ok)
    throw new Error(String(signing.error ?? "Unable to authorize the upload."));
  const signature = signing as UploadSignature;
  const body = new FormData();
  body.set("file", file, file instanceof File ? file.name : "hero-crop.jpg");
  body.set("api_key", signature.apiKey);
  body.set("overwrite", signature.overwrite);
  body.set("public_id", signature.public_id);
  body.set("timestamp", signature.timestamp);
  body.set("signature", signature.signature);
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
    { method: "POST", body },
  );
  const upload = await responseJson(uploadResponse);
  if (!uploadResponse.ok || typeof upload.public_id !== "string") {
    throw new Error("Cloudinary could not upload this photograph. Try again.");
  }
  return upload.public_id;
}

function PhotoCard({
  entry,
  desktopSource,
  onDesktopSourceChange,
  heroDescription,
  desktopHeroSaved,
  onDesktopHeroSaved,
}: {
  entry: Entry;
  desktopSource: File | null;
  onDesktopSourceChange: (selected: File | null) => void;
  heroDescription: string;
  desktopHeroSaved: boolean;
  onDesktopHeroSaved: (description: string) => void;
}) {
  const { slot, fallback } = entry;
  const [saved, setSaved] = useState(entry.image);
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [alt, setAlt] = useState(saved?.alt ?? fallback.alt);
  const [x, setX] = useState(
    Math.round((saved?.focal_x ?? fallback.focalX ?? 0.5) * 100),
  );
  const [y, setY] = useState(
    Math.round((saved?.focal_y ?? fallback.focalY ?? 0.5) * 100),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const source = selected;
  const previewUrl = source?.url ?? saved?.secure_url ?? fallback.src;

  useEffect(() => {
    return () => {
      if (selected) URL.revokeObjectURL(selected.url);
    };
  }, [selected]);

  function selectFile(file: File | undefined) {
    setError("");
    setConfirmation("");
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      setError("Choose a JPEG, PNG or WebP photograph.");
      return;
    }
    if (file.size > maximumFileSize) {
      setError("Choose a photograph smaller than 20 MB.");
      return;
    }
    const next = { file, url: URL.createObjectURL(file) };
    setSelected(next);
    if (slot !== "hero_mobile") setAlt("");
    if (slot === "hero_desktop") onDesktopSourceChange(file);
  }

  async function save() {
    setError("");
    setConfirmation("");
    const description = slot === "hero_mobile" ? heroDescription : alt.trim();
    if (slot === "hero_mobile" && !desktopHeroSaved) {
      setError(
        "Save the desktop hero and its shared description before the phone crop.",
      );
      return;
    }
    if (!description) {
      setError("Add a short description for screen readers before saving.");
      return;
    }
    if (!source && !saved) {
      setError("Select a photograph to replace the stock placeholder.");
      return;
    }
    setBusy(true);
    let uploadedPublicId: string | null = null;
    let committed = false;
    try {
      let publicId = saved?.cloudinary_public_id ?? "";
      if (source) {
        const file =
          slot === "hero_desktop" || slot === "hero_mobile"
            ? await cropHeroFile(source.file, heroCropSizes[slot], {
                x: x / 100,
                y: y / 100,
              })
            : source.file;
        publicId = await uploadFile(file);
        uploadedPublicId = publicId;
      }
      const response = await fetch("/api/admin/page-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot,
          publicId,
          expectedPublicId: saved?.cloudinary_public_id ?? "",
          alt: description,
          focalX: x / 100,
          focalY: y / 100,
        }),
      });
      const result = await responseJson(response);
      if (!response.ok || !result.image || typeof result.image !== "object") {
        throw new Error(String(result.error ?? "The image was not saved."));
      }
      setSaved(result.image as PageImageRow);
      committed = true;
      setSelected(null);
      if (slot === "hero_desktop") {
        onDesktopHeroSaved(description);
      }
      setConfirmation(
        "Image saved. It is visible when wedding details are published.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "The image was not saved.",
      );
    } finally {
      if (uploadedPublicId && !committed) {
        try {
          await fetch("/api/admin/page-images", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: uploadedPublicId }),
          });
        } catch {
          // Cloudinary's page folder can be checked for any interrupted uploads.
        }
      }
      setBusy(false);
    }
  }

  return (
    <article className="border-wedding-navy/16 bg-wedding-cream/52 phone:p-5 border p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="wedding-display text-wedding-brown m-0 text-[clamp(1.8rem,5vw,2.5rem)] leading-none">
            {labels[slot].title}
          </h2>
          <p className="text-wedding-navy/68 mt-2 mb-0 max-w-[38rem] text-sm leading-6">
            {labels[slot].advice}
          </p>
        </div>
        <span className="text-wedding-brown text-xs font-extrabold tracking-wider uppercase">
          {saved ? "Your image" : "Stock placeholder"}
        </span>
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]">
        <div>
          <div
            className={`bg-wedding-mist relative w-full overflow-hidden ${previewFrames[slot]}`}
          >
            {/* These previews include local blob URLs, which Next Image cannot optimize. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={
                (slot === "hero_mobile" ? heroDescription : alt.trim()) ||
                "Selected page photograph preview"
              }
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: `${x}% ${y}%` }}
            />
            {slot === "hero_desktop" || slot === "hero_mobile" ? (
              <span className="bg-wedding-navy/64 text-wedding-cream absolute bottom-3 left-3 max-w-[75%] px-2 py-1 text-xs font-bold">
                Preview headline area
              </span>
            ) : null}
          </div>
          <p className="text-wedding-navy/62 mt-2 mb-0 text-xs leading-5">
            {slot.startsWith("hero_")
              ? "Adjust the crop before upload; the public hero will still cover slightly different screen shapes."
              : "The source photo stays intact; the focal point controls cover framing."}
          </p>
        </div>
        <div className="grid content-start gap-5">
          <label className="text-wedding-brown grid gap-2 text-xs font-extrabold tracking-wider uppercase">
            Photograph
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => selectFile(event.currentTarget.files?.[0])}
              className="border-wedding-navy/20 bg-admin-field-surface/52 text-wedding-navy w-full min-w-0 border p-2 text-sm font-medium tracking-normal normal-case"
            />
          </label>
          {slot === "hero_mobile" && desktopSource ? (
            <button
              type="button"
              className={adminStyles.secondaryButton}
              disabled={busy}
              onClick={() => {
                setSelected({
                  file: desktopSource,
                  url: URL.createObjectURL(desktopSource),
                });
                setError("");
              }}
            >
              Use selected desktop source for phone crop
            </button>
          ) : null}
          {slot === "hero_mobile" ? (
            <p className="text-wedding-navy/68 m-0 text-xs leading-5">
              The phone crop uses the shared hero description saved with the
              desktop crop.
            </p>
          ) : (
            <label className="text-wedding-brown grid gap-2 text-xs font-extrabold tracking-wider uppercase">
              Image description
              <input
                value={alt}
                maxLength={180}
                disabled={busy}
                onChange={(event) => setAlt(event.currentTarget.value)}
                className="border-wedding-navy/20 bg-admin-field-surface/52 text-wedding-navy w-full border px-3 py-2 text-sm font-medium tracking-normal normal-case"
              />
            </label>
          )}
          <label className="text-wedding-brown grid gap-2 text-xs font-extrabold">
            Horizontal position - {x}%
            <input
              type="range"
              min="0"
              max="100"
              value={x}
              disabled={busy}
              onChange={(event) => setX(Number(event.currentTarget.value))}
              className="accent-wedding-blue w-full"
            />
          </label>
          <label className="text-wedding-brown grid gap-2 text-xs font-extrabold">
            Vertical position - {y}%
            <input
              type="range"
              min="0"
              max="100"
              value={y}
              disabled={busy}
              onChange={(event) => setY(Number(event.currentTarget.value))}
              className="accent-wedding-blue w-full"
            />
          </label>
          <p aria-live="polite" className={`${adminStyles.formError} min-h-0`}>
            {error}
          </p>
          {confirmation ? (
            <p
              aria-live="polite"
              className="text-status-success m-0 text-xs font-bold"
            >
              {confirmation}
            </p>
          ) : null}
          <button
            type="button"
            className={adminStyles.primaryButton}
            disabled={busy}
            onClick={save}
          >
            {busy ? "Saving image..." : `Save ${labels[slot].title}`}
          </button>
        </div>
      </div>
    </article>
  );
}

export function PageImageEditor({ entries }: { entries: Entry[] }) {
  const [desktopSource, setDesktopSource] = useState<File | null>(null);
  const desktopHero = entries.find((entry) => entry.slot === "hero_desktop");
  const [heroDescription, setHeroDescription] = useState(
    desktopHero?.image?.alt ?? desktopHero?.fallback.alt ?? "",
  );
  const [desktopHeroSaved, setDesktopHeroSaved] = useState(
    Boolean(desktopHero?.image),
  );
  return (
    <div className="mt-12 grid gap-5">
      <p className="border-wedding-blue bg-wedding-navy/7 text-wedding-navy/78 m-0 border-l-[3px] p-4 text-sm leading-6">
        The current placeholders are stock photographs, not photos of Felix and
        Gift. Replacing them here does not change the mock gallery.
      </p>
      {entries.map((entry) => (
        <PhotoCard
          key={entry.slot}
          entry={entry}
          desktopSource={desktopSource}
          onDesktopSourceChange={setDesktopSource}
          heroDescription={heroDescription}
          desktopHeroSaved={desktopHeroSaved}
          onDesktopHeroSaved={(description) => {
            setHeroDescription(description);
            setDesktopHeroSaved(true);
          }}
        />
      ))}
    </div>
  );
}
