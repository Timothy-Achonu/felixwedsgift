"use client";

import { Check, ImagePlus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  guestPhotoMimeTypes,
  maximumGuestPhotoBatch,
  maximumGuestPhotoBytes,
  maximumGuestPhotoDimension,
  maximumPhotoCaptionLength,
} from "@/lib/photos/constants";

type Preview = {
  id: string;
  file: File;
  url: string;
  caption: string;
  progress: number;
  state: "ready" | "uploading" | "complete" | "failed";
};
type Authorization = {
  id: string;
  cloudName: string;
  apiKey: string;
  overwrite: boolean;
  public_id: string;
  timestamp: number;
  signature: string;
};

async function imageDimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function uploadFile(
  preview: Preview,
  authorization: Authorization,
  onProgress: (value: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(authorization.cloudName)}/image/authenticated`,
    );
    request.upload.onprogress = (event) =>
      event.lengthComputable &&
      onProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error("Upload interrupted."));
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Upload failed."));
    const body = new FormData();
    body.set("file", preview.file, preview.file.name);
    body.set("api_key", authorization.apiKey);
    body.set("overwrite", String(authorization.overwrite));
    body.set("public_id", authorization.public_id);
    body.set("timestamp", String(authorization.timestamp));
    body.set("signature", authorization.signature);
    request.send(body);
  });
}

export function PhotoUploadDemo() {
  const batchIdRef = useRef(crypto.randomUUID());
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const previewsRef = useRef(previews);
  useEffect(() => void (previewsRef.current = previews), [previews]);
  useEffect(
    () => () =>
      previewsRef.current.forEach(({ url }) => URL.revokeObjectURL(url)),
    [],
  );

  function update(id: string, values: Partial<Preview>) {
    setPreviews((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item)),
    );
  }

  async function addFiles(list: FileList | File[]) {
    setError("");
    const slots = maximumGuestPhotoBatch - previews.length;
    if (slots < 1) return setError("You already selected 10 photos.");
    const additions: Preview[] = [];
    const messages: string[] = [];
    for (const file of Array.from(list).slice(0, slots)) {
      if (
        !guestPhotoMimeTypes.includes(
          file.type as (typeof guestPhotoMimeTypes)[number],
        )
      ) {
        messages.push(`${file.name} is not a JPEG, PNG, or WebP photo.`);
        continue;
      }
      if (file.size < 1 || file.size > maximumGuestPhotoBytes) {
        messages.push(`${file.name} must be no larger than 10 MB.`);
        continue;
      }
      try {
        const { width, height } = await imageDimensions(file);
        if (
          width < 1 ||
          height < 1 ||
          width > maximumGuestPhotoDimension ||
          height > maximumGuestPhotoDimension
        ) {
          messages.push(`${file.name} is larger than 8192 pixels on one side.`);
          continue;
        }
      } catch {
        messages.push(`${file.name} could not be opened as a photograph.`);
        continue;
      }
      additions.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        caption: "",
        progress: 0,
        state: "ready",
      });
    }
    setPreviews((current) => [...current, ...additions]);
    if (Array.from(list).length > slots)
      messages.push(`Only the first ${slots} photos were considered.`);
    setError(messages.join(" "));
  }

  function reset() {
    previews.forEach(({ url }) => URL.revokeObjectURL(url));
    setPreviews([]);
    setError("");
    setBusy(false);
    setSuccess(false);
    batchIdRef.current = crypto.randomUUID();
  }

  async function startUpload() {
    const pending = previews.filter(({ state }) => state !== "complete");
    if (!pending.length) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/photos/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: batchIdRef.current,
          files: pending.map(({ id, file }) => ({
            id,
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        uploads?: Authorization[];
      };
      if (!response.ok || !result.uploads)
        throw new Error(result.error ?? "We couldn't prepare your photos.");
      const uploaded: Preview[] = [];
      for (const preview of pending) {
        const authorization = result.uploads.find(
          ({ id }) => id === preview.id,
        );
        if (!authorization) continue;
        update(preview.id, { state: "uploading", progress: 0 });
        try {
          await uploadFile(preview, authorization, (progress) =>
            update(preview.id, { progress }),
          );
        } catch {
          // A lost response does not prove Cloudinary rejected the bytes. Let
          // the completion endpoint verify the asset and clean it up if absent.
          update(preview.id, { state: "uploading" });
        } finally {
          uploaded.push(preview);
        }
      }
      if (uploaded.length) {
        const completion = await fetch("/api/photos/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: uploaded.map(({ id, caption }) => ({ id, caption })),
          }),
        });
        const result = (await completion.json()) as {
          results?: Array<{ id: string; ok: boolean }>;
        };
        uploaded.forEach(({ id }) =>
          update(id, {
            state: result.results?.find((item) => item.id === id)?.ok
              ? "complete"
              : "failed",
            progress: 100,
          }),
        );
      }
      window.setTimeout(() => {
        const hasFailures = previewsRef.current.some(
          ({ state }) => state === "failed",
        );
        if (hasFailures)
          setError("Some photos could not be sent. Retry the failed photos.");
        else setSuccess(true);
      }, 0);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't upload those photos.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (success)
    return (
      <div
        className="border-wedding-cream/50 flex min-h-[34rem] flex-col items-center justify-center border px-6 py-10 text-center"
        role="status"
      >
        <span className="bg-wedding-blue text-wedding-brown mb-6 grid size-18 place-items-center rounded-full">
          <Check aria-hidden="true" />
        </span>
        <p className="eyebrow">Photos received</p>
        <h3 className="wedding-display mt-3 mb-4 max-w-[12ch] text-[2.5rem] leading-none font-medium">
          Thank you for sharing the joy.
        </h3>
        <p className="text-wedding-cream/72 mb-7 max-w-[28rem] leading-[1.7]">
          Your photos are waiting for review before they appear in the album.
        </p>
        <button
          type="button"
          className="button button-cream focus-ring"
          onClick={reset}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Share more photos
        </button>
      </div>
    );

  return (
    <div className="min-w-0">
      <div
        className="border-wedding-cream/52 hover:border-wedding-blue flex min-h-[22rem] flex-col items-center justify-center border px-5 py-10 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void addFiles(event.dataTransfer.files);
        }}
      >
        <ImagePlus
          aria-hidden="true"
          className="text-wedding-blue size-12"
          strokeWidth={1.25}
        />
        <h3 className="wedding-display mt-6 mb-3 text-[2.3rem] leading-none font-medium">
          Bring your view of the day
        </h3>
        <p className="text-wedding-cream/70 mb-7 text-[0.83rem]">
          Choose up to 10 JPEG, PNG, or WebP photos, 10 MB each.
        </p>
        <label className="button button-cream focus-within:ring-wedding-blue focus-within:ring-2">
          <ImagePlus className="size-4" aria-hidden="true" />
          Choose photos
          <input
            className="sr-only"
            aria-label="Choose photos"
            type="file"
            accept={guestPhotoMimeTypes.join(",")}
            multiple
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-wedding-cream/74 mt-4 flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        By uploading, you confirm you may share these photos and understand that
        approved photos may appear publicly.
      </p>
      {error ? (
        <p
          className="border-wedding-blue bg-wedding-navy/24 mt-4 border-l-[3px] px-3 py-2 text-[0.8rem]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {previews.length ? (
        <div className="mt-8">
          <div className="flex justify-between">
            <p className="m-0 text-[0.8rem] font-bold uppercase">
              Your selection{" "}
              <span className="text-wedding-blue">{previews.length}/10</span>
            </p>
            <button
              className="text-link focus-ring"
              type="button"
              onClick={reset}
              disabled={busy}
            >
              Clear all
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {previews.map((preview) => (
              <article className="border-wedding-cream/30 p-3" key={preview.id}>
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={preview.url}
                    alt={`Preview of ${preview.file.name}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${preview.file.name}`}
                    className="focus-ring bg-wedding-navy absolute top-2 right-2 grid size-8 place-items-center rounded-full"
                    disabled={busy || preview.state === "complete"}
                    onClick={() => {
                      URL.revokeObjectURL(preview.url);
                      setPreviews((current) =>
                        current.filter(({ id }) => id !== preview.id),
                      );
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <label className="mt-3 grid gap-2 text-xs font-bold uppercase">
                  Caption{" "}
                  <span className="text-wedding-cream/60 font-medium lowercase">
                    optional
                  </span>
                  <textarea
                    className="border-wedding-cream/45 bg-transparent p-2 text-sm font-normal normal-case"
                    rows={2}
                    maxLength={maximumPhotoCaptionLength}
                    value={preview.caption}
                    disabled={busy || preview.state === "complete"}
                    onChange={(event) =>
                      update(preview.id, { caption: event.target.value })
                    }
                  />
                </label>
                {preview.state !== "ready" ? (
                  <p className="mt-2 mb-0 text-xs" aria-live="polite">
                    {preview.state === "complete"
                      ? "Ready for review"
                      : preview.state === "failed"
                        ? "Upload failed"
                        : `Uploading ${preview.progress}%`}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <button
            type="button"
            className="button button-blue focus-ring mt-6 w-full"
            disabled={busy}
            onClick={() => void startUpload()}
          >
            {busy
              ? "Sharing photos..."
              : previews.some(({ state }) => state === "failed")
                ? "Retry failed photos"
                : "Share photos for review"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
