"use client";

import { Check, ImagePlus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Preview = {
  id: string;
  file: File;
  url: string;
};

type UploadStatus = "idle" | "uploading" | "success";

function fileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function PhotoUploadDemo() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const previewRef = useRef<Preview[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    previewRef.current = previews;
  }, [previews]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      previewRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [],
  );

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const openSlots = MAX_FILES - previews.length;

    if (openSlots <= 0) {
      setError(`You can preview up to ${MAX_FILES} photos at a time.`);
      return;
    }

    const invalidType = incoming.find((file) => !ACCEPTED_TYPES.has(file.type));
    if (invalidType) {
      setError("Choose JPEG, PNG, or WebP photos only.");
      return;
    }

    const oversized = incoming.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`${oversized.name} is larger than 10 MB.`);
      return;
    }

    const existingIds = new Set(previews.map(({ id }) => id));
    const additions = incoming
      .filter((file) => !existingIds.has(fileId(file)))
      .slice(0, openSlots)
      .map((file) => ({
        id: fileId(file),
        file,
        url: URL.createObjectURL(file),
      }));

    if (additions.length === 0) {
      setError("Those photos are already in your selection.");
      return;
    }

    setPreviews((current) => [...current, ...additions]);
    setError(
      incoming.length > openSlots
        ? `Only the first ${openSlots} photos were added.`
        : "",
    );
    setStatus("idle");
    setProgress(0);
  }

  function removePreview(id: string) {
    setPreviews((current) => {
      const removed = current.find((preview) => preview.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((preview) => preview.id !== id);
    });
    setStatus("idle");
    setProgress(0);
  }

  function resetDemo() {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviews([]);
    setGuestName("");
    setCaption("");
    setError("");
    setProgress(0);
    setStatus("idle");
  }

  async function startDemo() {
    if (previews.length === 0) {
      setError("Choose at least one photo to begin the preview.");
      return;
    }

    setError("");
    setProgress(8);
    setStatus("uploading");

    for (const step of [22, 41, 63, 82, 100]) {
      await new Promise((resolve) => window.setTimeout(resolve, 240));
      if (!mountedRef.current) return;
      setProgress(step);
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div
        className="border-wedding-cream/50 flex min-h-[34rem] flex-col items-center justify-center border px-6 py-10 text-center"
        role="status"
      >
        <span
          className="bg-wedding-blue text-wedding-brown mb-6 grid size-18 place-items-center rounded-full"
          aria-hidden="true"
        >
          <Check />
        </span>
        <p className="eyebrow">Preview complete</p>
        <h3 className="wedding-display mt-[0.8rem] mb-4 max-w-[12ch] text-[2.5rem] leading-none font-medium">
          Thank you for sharing the joy.
        </h3>
        <p className="text-wedding-cream/72 mb-7 max-w-[28rem] leading-[1.7]">
          In the live experience, your photos will be sent to Felix and Gift for
          review. No files left your device in this prototype.
        </p>
        <button
          type="button"
          className="button button-cream focus-ring"
          onClick={resetDemo}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Try another selection
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div
        className="border-wedding-cream/52 hover:border-wedding-blue hover:bg-wedding-navy/12 flex min-h-[25rem] flex-col items-center justify-center border px-5 py-10 text-center transition-[background-color,border-color] duration-180 ease-out"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <ImagePlus
          aria-hidden="true"
          className="text-wedding-blue size-12"
          strokeWidth={1.25}
        />
        <h3 className="wedding-display mt-6 mb-3 max-w-[12ch] text-[2.3rem] leading-none font-medium">
          Bring your view of the day
        </h3>
        <p className="text-wedding-cream/70 mb-7 max-w-[23rem] text-[0.83rem] leading-[1.6]">
          Choose up to 10 JPEG, PNG, or WebP photos, 10 MB each.
        </p>
        <label className="button button-cream focus-within:ring-wedding-blue focus-within:ring-2">
          <ImagePlus aria-hidden="true" className="size-4" />
          Choose photos
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={status === "uploading"}
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <p className="text-wedding-cream/74 mt-[0.9rem] mb-0 flex items-center gap-2 text-[0.72rem]">
        <ShieldCheck aria-hidden="true" className="size-4" />
        Prototype mode: your photos stay on this device.
      </p>

      {error ? (
        <p
          className="border-wedding-blue bg-wedding-navy/24 mt-4 mb-0 border-l-[3px] px-[0.8rem] py-[0.65rem] text-[0.8rem]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <p className="m-0 text-[0.8rem] font-[750] uppercase">
              Your selection{" "}
              <span className="text-wedding-blue">
                {previews.length}/{MAX_FILES}
              </span>
            </p>
            <button
              type="button"
              onClick={resetDemo}
              className="text-link focus-ring"
            >
              Clear all
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-[0.65rem] sm:grid-cols-5">
            {previews.map((preview) => (
              <figure
                className="bg-wedding-navy relative m-0 aspect-square overflow-hidden"
                key={preview.id}
              >
                <Image
                  src={preview.url}
                  alt={`Preview of ${preview.file.name}`}
                  width={160}
                  height={160}
                  unoptimized
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove ${preview.file.name}`}
                  className="focus-ring bg-wedding-navy text-wedding-cream absolute top-[0.35rem] right-[0.35rem] grid size-8 place-items-center rounded-full border-0"
                  onClick={() => removePreview(preview.id)}
                  disabled={status === "uploading"}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </figure>
            ))}
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-[0.6rem]">
              <span className="text-xs font-[750] uppercase">
                Your name{" "}
                <em className="text-wedding-cream/60 text-[0.68rem] font-medium lowercase not-italic">
                  optional
                </em>
              </span>
              <input
                className="border-wedding-cream/45 text-wedding-cream focus:border-wedding-blue w-full resize-y rounded-none border-0 border-b bg-transparent py-3"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                maxLength={80}
                disabled={status === "uploading"}
              />
            </label>
            <label className="grid gap-[0.6rem]">
              <span className="text-xs font-[750] uppercase">
                A note for the couple{" "}
                <em className="text-wedding-cream/60 text-[0.68rem] font-medium lowercase not-italic">
                  optional
                </em>
              </span>
              <textarea
                className="border-wedding-cream/45 text-wedding-cream focus:border-wedding-blue w-full resize-y rounded-none border-0 border-b bg-transparent py-3"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={240}
                rows={3}
                disabled={status === "uploading"}
              />
            </label>
          </div>

          {status === "uploading" ? (
            <div className="mt-6" aria-live="polite">
              <div className="flex items-center justify-between gap-4 text-[0.72rem] font-bold">
                <span>Preparing your preview</span>
                <span>{progress}%</span>
              </div>
              <div
                className="bg-wedding-cream/20 [&>span]:bg-wedding-blue mt-[0.6rem] h-[3px] overflow-hidden [&>span]:block [&>span]:h-full [&>span]:transition-[width] [&>span]:duration-220"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="button button-blue focus-ring mt-6 w-full"
            onClick={startDemo}
            disabled={status === "uploading"}
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            {status === "uploading" ? "Preparing..." : "Preview upload"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
