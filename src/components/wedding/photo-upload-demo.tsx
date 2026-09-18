"use client";

import {
  Check,
  CircleAlert,
  CircleX,
  ImagePlus,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  guestPhotoMimeTypes,
  guestPhotoUploadConcurrency,
  maximumGuestPhotoBatch,
  maximumGuestPhotoBytes,
  maximumGuestPhotoDimension,
  maximumPhotoCaptionLength,
} from "@/lib/photos/constants";
import { runWithConcurrency } from "@/lib/photos/run-with-concurrency";

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
  type: "authenticated";
};
type UploadPhase = "idle" | "preparing" | "uploading" | "finalizing" | "failed";

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
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(authorization.cloudName)}/image/upload`,
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
    body.set("type", authorization.type);
    body.set("signature", authorization.signature);
    request.send(body);
  });
}

const desktopSuccessQuery = "(min-width: 640px)";

function useSuccessPresentation(open: boolean) {
  const [isDesktop, setIsDesktop] = useState(false);
  const locked = useRef<"modal" | "bottom-sheet" | null>(null);

  useEffect(() => {
    const media = window.matchMedia(desktopSuccessQuery);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const live = isDesktop ? "modal" : "bottom-sheet";
  if (open) locked.current ??= live;
  else locked.current = null;
  return locked.current ?? live;
}

function SuccessCopy({
  showHandle,
  title,
  description,
  onShareMore,
}: {
  showHandle: boolean;
  title: ReactNode;
  description: ReactNode;
  onShareMore: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-2 pt-2 pb-2 text-center">
      {showHandle ? (
        <div
          className="bg-wedding-navy/20 mb-6 h-1.5 w-12 rounded-full"
          aria-hidden="true"
        />
      ) : null}
      <span className="bg-wedding-blue text-wedding-brown mb-6 grid size-18 place-items-center rounded-full">
        <Check aria-hidden="true" />
      </span>
      <p className="eyebrow text-wedding-brown">Photos received</p>
      {title}
      {description}
      <Button type="button" variant="navy" onClick={onShareMore}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Share more photos
      </Button>
    </div>
  );
}

function UploadProgressTracker({
  phase,
  progress,
  total,
  completed,
  error,
  minimized,
  onMinimize,
  onExpand,
}: {
  phase: Exclude<UploadPhase, "idle">;
  progress: number;
  total: number;
  completed: number;
  error: string;
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
}) {
  const label =
    phase === "preparing"
      ? "Preparing your photos"
      : phase === "finalizing"
        ? "Saving your photos"
        : phase === "failed"
          ? "Upload needs attention"
          : `Uploading ${completed} of ${total} photos`;
  const detail =
    phase === "preparing"
      ? "Setting up a secure upload."
      : phase === "finalizing"
        ? "Your photos have uploaded and are being saved for review."
        : phase === "failed"
          ? error
          : `${progress}% uploaded`;

  if (minimized) {
    return (
      <button
        type="button"
        className="focus-ring bg-wedding-navy text-wedding-cream border-wedding-cream/25 fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full border shadow-[0_0.8rem_2rem_color-mix(in_srgb,var(--wedding-navy)_42%,transparent)]"
        aria-label={`${label}. ${detail}. Expand upload progress.`}
        onClick={onExpand}
      >
        <span
          className="grid size-10 place-items-center rounded-full p-0.75"
          style={{
            background: `conic-gradient(var(--wedding-blue) ${progress}%, color-mix(in srgb, var(--wedding-cream) 24%, transparent) 0)`,
          }}
        >
          <span className="bg-wedding-navy grid size-full place-items-center rounded-full text-[0.62rem] font-extrabold">
            {phase === "failed" ? "!" : `${progress}%`}
          </span>
        </span>
      </button>
    );
  }

  return (
    <section
      className="bg-wedding-cream text-wedding-navy border-wedding-navy/16 fixed top-4 right-4 left-4 z-50 mx-auto w-[min(calc(100%-2rem),38rem)] border p-4 shadow-[0_0.9rem_2.5rem_color-mix(in_srgb,var(--wedding-navy)_32%,transparent)]"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Photo upload progress"
    >
      <div className="flex items-start gap-3">
        <span className="bg-wedding-blue text-wedding-brown grid size-10 shrink-0 place-items-center rounded-full">
          {phase === "failed" ? (
            <CircleAlert aria-hidden="true" className="size-5" />
          ) : (
            <Upload aria-hidden="true" className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-extrabold">{label}</p>
          <p className="text-wedding-navy/68 mt-1 mb-0 text-xs leading-relaxed">
            {detail}
          </p>
        </div>
        <button
          type="button"
          className="focus-ring grid size-9 shrink-0 place-items-center"
          aria-label="Minimize upload progress"
          onClick={onMinimize}
        >
          <Minimize2 aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div
        className="bg-wedding-navy/12 mt-4 h-2 overflow-hidden"
        role="progressbar"
        aria-label="Photo upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="bg-wedding-blue h-full transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

function PhotoUploadSuccess({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  const presentation = useSuccessPresentation(open);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || presentation !== "modal" || !open) return;
    if (!dialog.open) dialog.showModal();
  }, [open, presentation]);

  const description = (
    <p className="text-wedding-navy/72 mb-7 max-w-[28rem] leading-[1.7]">
      Your photos are waiting for review before they appear in the album.
    </p>
  );

  if (presentation === "modal") {
    if (!open) return null;
    return (
      <dialog
        ref={dialogRef}
        aria-labelledby="photo-upload-success-title"
        className="backdrop:bg-wedding-navy/70 m-0 box-border h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 open:fixed open:inset-0 open:flex open:items-center open:justify-center"
        onCancel={(event) => {
          event.preventDefault();
          onDismiss();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onDismiss();
        }}
      >
        <div className="relative w-[min(calc(100vw-2rem),28rem)]">
          <button
            type="button"
            aria-label="Close photo upload success dialog"
            className="focus-ring text-wedding-cream absolute -top-14 right-0 grid size-10 place-items-center rounded-full transition-opacity hover:opacity-75"
            onClick={onDismiss}
          >
            <CircleX className="size-8" strokeWidth={2.5} aria-hidden="true" />
          </button>
          <div className="bg-wedding-cream text-wedding-navy rounded-2xl px-6 py-10 shadow-[0_1.2rem_3rem_color-mix(in_srgb,var(--wedding-navy)_28%,transparent)]">
            <SuccessCopy
              showHandle={false}
              title={
                <h3
                  id="photo-upload-success-title"
                  className="wedding-display mt-3 mb-4 max-w-[12ch] text-[2.5rem] leading-none font-medium"
                >
                  Thank you for sharing the joy.
                </h3>
              }
              description={description}
              onShareMore={onDismiss}
            />
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <DrawerContent>
        <SuccessCopy
          showHandle
          title={
            <DrawerTitle className="mt-3 mb-4 max-w-[12ch]">
              Thank you for sharing the joy.
            </DrawerTitle>
          }
          description={
            <DrawerDescription className="mb-7 max-w-[28rem]">
              Your photos are waiting for review before they appear in the
              album.
            </DrawerDescription>
          }
          onShareMore={onDismiss}
        />
      </DrawerContent>
    </Drawer>
  );
}

export function PhotoUploadDemo() {
  const batchIdRef = useRef(crypto.randomUUID());
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [activeUploadIds, setActiveUploadIds] = useState<string[]>([]);
  const [trackerMinimized, setTrackerMinimized] = useState(false);
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
    if (slots < 1)
      return setError(`You already selected ${maximumGuestPhotoBatch} photos.`);
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
    setUploadPhase("idle");
    setActiveUploadIds([]);
    setTrackerMinimized(false);
    batchIdRef.current = crypto.randomUUID();
  }

  async function startUpload() {
    const pending = previews.filter(({ state }) => state !== "complete");
    if (!pending.length) return;
    setBusy(true);
    setError("");
    setUploadPhase("preparing");
    setActiveUploadIds(pending.map(({ id }) => id));
    setTrackerMinimized(false);
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
      let authorizationMissing = false;
      setUploadPhase("uploading");
      await runWithConcurrency(
        pending,
        guestPhotoUploadConcurrency,
        async (preview) => {
          const authorization = result.uploads?.find(
            ({ id }) => id === preview.id,
          );
          if (!authorization) {
            authorizationMissing = true;
            update(preview.id, { state: "failed" });
            return;
          }
          update(preview.id, { state: "uploading", progress: 0 });
          try {
            await uploadFile(preview, authorization, (progress) =>
              update(preview.id, { progress }),
            );
          } catch {
            // A lost response does not prove Cloudinary rejected the bytes. Let
            // the completion endpoint verify the asset and clean it up if absent.
            update(preview.id, { state: "uploading" });
          }
          uploaded.push(preview);
        },
      );
      if (!uploaded.length) {
        setError("Some photos could not be sent. Retry the failed photos.");
        setUploadPhase("failed");
        return;
      }
      let completionResults: Array<{ id: string; ok: boolean }> = [];
      try {
        setUploadPhase("finalizing");
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
        if (!completion.ok || !Array.isArray(result.results))
          throw new Error("The server returned an invalid upload result.");
        completionResults = result.results;
      } catch {
        uploaded.forEach(({ id }) =>
          update(id, { state: "failed", progress: 100 }),
        );
        setError("Some photos could not be sent. Retry the failed photos.");
        setUploadPhase("failed");
        return;
      }
      let completionFailed = authorizationMissing;
      uploaded.forEach(({ id }) => {
        const completed =
          completionResults.find((item) => item.id === id)?.ok === true;
        if (!completed) completionFailed = true;
        update(id, {
          state: completed ? "complete" : "failed",
          progress: 100,
        });
      });
      if (completionFailed)
        setError("Some photos could not be sent. Retry the failed photos.");
      if (completionFailed) {
        setUploadPhase("failed");
      } else {
        setUploadPhase("idle");
        setActiveUploadIds([]);
        setSuccess(true);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't upload those photos.",
      );
      setUploadPhase("failed");
    } finally {
      setBusy(false);
    }
  }

  const activeUploads = previews.filter(({ id }) =>
    activeUploadIds.includes(id),
  );
  const activeUploadBytes = activeUploads.reduce(
    (total, preview) => total + preview.file.size,
    0,
  );
  const uploadedBytes = activeUploads.reduce(
    (total, preview) => total + (preview.file.size * preview.progress) / 100,
    0,
  );
  const uploadProgress = activeUploadBytes
    ? Math.min(100, Math.round((uploadedBytes / activeUploadBytes) * 100))
    : 0;
  const completedUploads = activeUploads.filter(
    ({ state }) => state === "complete",
  ).length;

  return (
    <div className="min-w-0">
      {uploadPhase !== "idle" ? (
        <UploadProgressTracker
          phase={uploadPhase}
          progress={uploadProgress}
          total={activeUploads.length}
          completed={completedUploads}
          error={error}
          minimized={trackerMinimized}
          onMinimize={() => setTrackerMinimized(true)}
          onExpand={() => setTrackerMinimized(false)}
        />
      ) : null}
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
          Choose up to {maximumGuestPhotoBatch} JPEG, PNG, or WebP photos, 10 MB
          each.
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
              <span className="text-wedding-blue">
                {previews.length}/{maximumGuestPhotoBatch}
              </span>
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {previews.map((preview) => (
              <article
                className="border-wedding-cream/40 border p-2"
                key={preview.id}
              >
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
                <label className="mt-2 grid gap-1 text-[0.68rem] font-bold tracking-[0.06em] uppercase">
                  Caption{" "}
                  <span className="text-wedding-cream/70 font-medium normal-case">
                    optional
                  </span>
                  <textarea
                    className="border-wedding-cream bg-wedding-cream/10 placeholder:text-wedding-cream/55 border p-2 text-sm font-normal tracking-normal normal-case"
                    rows={1}
                    maxLength={maximumPhotoCaptionLength}
                    value={preview.caption}
                    placeholder="Add a caption (optional)"
                    disabled={busy || preview.state === "complete"}
                    onChange={(event) =>
                      update(preview.id, { caption: event.target.value })
                    }
                  />
                </label>
                {preview.state !== "ready" ? (
                  <p className="mt-1.5 mb-0 text-xs" aria-live="polite">
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
          <Button
            type="button"
            variant="blue"
            className="mt-6 w-full"
            isLoading={busy}
            disabled={busy}
            onClick={() => void startUpload()}
          >
            {busy
              ? "Uploading..."
              : previews.some(({ state }) => state === "failed")
                ? "Retry failed photos"
                : "Share photos for review"}
          </Button>
        </div>
      ) : null}
      <PhotoUploadSuccess open={success} onDismiss={reset} />
    </div>
  );
}
