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
      <div className="upload-success" role="status">
        <span className="upload-success-icon" aria-hidden="true">
          <Check />
        </span>
        <p className="eyebrow">Preview complete</p>
        <h3 className="font-display">Thank you for sharing the joy.</h3>
        <p>
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
    <div className="upload-demo">
      <div
        className="upload-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <ImagePlus
          aria-hidden="true"
          className="upload-icon"
          strokeWidth={1.25}
        />
        <h3 className="font-display">Bring your view of the day</h3>
        <p>Choose up to 10 JPEG, PNG, or WebP photos, 10 MB each.</p>
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

      <p className="prototype-notice">
        <ShieldCheck aria-hidden="true" className="size-4" />
        Prototype mode: your photos stay on this device.
      </p>

      {error ? (
        <p className="upload-error" role="alert">
          {error}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <div className="upload-selection">
          <div className="upload-selection-heading">
            <p>
              Your selection{" "}
              <span>
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

          <div className="upload-previews">
            {previews.map((preview) => (
              <figure key={preview.id}>
                <Image
                  src={preview.url}
                  alt={`Preview of ${preview.file.name}`}
                  width={160}
                  height={160}
                  unoptimized
                />
                <button
                  type="button"
                  aria-label={`Remove ${preview.file.name}`}
                  className="focus-ring"
                  onClick={() => removePreview(preview.id)}
                  disabled={status === "uploading"}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </figure>
            ))}
          </div>

          <div className="upload-fields">
            <label>
              <span>
                Your name <em>optional</em>
              </span>
              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                maxLength={80}
                disabled={status === "uploading"}
              />
            </label>
            <label>
              <span>
                A note for the couple <em>optional</em>
              </span>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={240}
                rows={3}
                disabled={status === "uploading"}
              />
            </label>
          </div>

          {status === "uploading" ? (
            <div className="upload-progress" aria-live="polite">
              <div className="upload-progress-copy">
                <span>Preparing your preview</span>
                <span>{progress}%</span>
              </div>
              <div
                className="upload-progress-track"
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
            className="button button-blue focus-ring upload-submit"
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
