"use client";

import { Download, Trash2 } from "lucide-react";
import { useState } from "react";

import type { AdminPhoto } from "@/lib/photos/constants";

export function PhotoModeration({
  initialPhotos,
}: {
  initialPhotos: AdminPhoto[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function action(
    photo: AdminPhoto,
    operation: "approve" | "reject" | "caption",
    caption = photo.caption ?? "",
  ) {
    const response = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: operation,
        expectedRevision: photo.revision,
        caption,
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      photo?: {
        revision: number;
        status?: AdminPhoto["status"];
        caption?: string | null;
      };
    };
    if (!response.ok || !result.photo)
      throw new Error(result.error ?? "The photograph could not be updated.");
    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id
          ? {
              ...item,
              ...result.photo,
              caption:
                operation === "caption" ? caption.trim() || null : item.caption,
            }
          : item,
      ),
    );
  }

  async function bulk(operation: "approve" | "reject") {
    setBusy(true);
    setMessage("");
    const targets = photos.filter(({ id }) => selected.includes(id));
    try {
      const response = await fetch("/api/admin/photos/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: operation,
          photos: targets.map(({ id, revision }) => ({ id, revision })),
        }),
      });
      const result = (await response.json()) as {
        results?: Array<{
          id: string;
          ok: boolean;
          photo?: { revision: number; status: AdminPhoto["status"] };
        }>;
      };
      const outcomes = result.results ?? [];
      setPhotos((current) =>
        current.map((photo) => {
          const outcome = outcomes.find(({ id }) => id === photo.id);
          return outcome?.ok && outcome.photo
            ? { ...photo, ...outcome.photo }
            : photo;
        }),
      );
      setSelected([]);
      setMessage(
        outcomes.every(({ ok }) => ok)
          ? "Selected photographs updated."
          : "Some photographs could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo: AdminPhoto) {
    if (
      !window.confirm(
        "Delete this photograph permanently? This cannot be undone.",
      )
    )
      return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/photos/${photo.id}?revision=${photo.revision}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Deletion failed.");
      setPhotos((current) => current.filter(({ id }) => id !== photo.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Deletion failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!photos.length)
    return (
      <p className="border-wedding-navy/24 text-wedding-navy/68 mt-12 border border-dashed p-8 text-sm">
        You&apos;re all caught up.
      </p>
    );
  return (
    <div className="mt-10">
      <div className="border-wedding-navy/14 flex flex-wrap items-center gap-3 border-y py-4">
        <span className="text-xs font-bold uppercase">
          {selected.length} selected
        </span>
        <button
          className="button button-outline-navy"
          disabled={!selected.length || busy}
          onClick={() => void bulk("approve")}
        >
          Approve selected
        </button>
        <button
          className="button button-outline-navy"
          disabled={!selected.length || busy}
          onClick={() => void bulk("reject")}
        >
          Reject selected
        </button>
        {message ? (
          <span className="text-sm" role="status">
            {message}
          </span>
        ) : null}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article
            className="border-wedding-navy/16 bg-wedding-cream/60 border p-3"
            key={photo.id}
          >
            <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase">
              <input
                type="checkbox"
                checked={selected.includes(photo.id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, photo.id]
                      : current.filter((id) => id !== photo.id),
                  )
                }
              />
              Select
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="aspect-4/3 w-full object-cover"
              src={`/api/admin/photos/${photo.id}/preview`}
              alt={photo.caption || "Guest wedding photograph"}
            />
            <div className="mt-4 flex justify-between gap-3 text-xs">
              <strong>{photo.status}</strong>
              <span>
                {(photo.bytes / 1_000_000).toFixed(1)} MB · {photo.width}×
                {photo.height}
              </span>
            </div>
            <label className="mt-4 grid gap-2 text-xs font-bold uppercase">
              Caption
              <textarea
                className="border-wedding-navy/18 border bg-transparent p-2 text-sm font-normal normal-case"
                defaultValue={photo.caption ?? ""}
                maxLength={240}
                rows={2}
                onBlur={(event) => {
                  if (event.target.value.trim() !== (photo.caption ?? ""))
                    void action(photo, "caption", event.target.value).catch(
                      (error) => setMessage(error.message),
                    );
                }}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="button button-outline-navy"
                disabled={busy || photo.status === "APPROVED"}
                onClick={() =>
                  void action(photo, "approve").catch((error) =>
                    setMessage(error.message),
                  )
                }
              >
                Approve
              </button>
              <button
                className="button button-outline-navy"
                disabled={busy || photo.status === "REJECTED"}
                onClick={() =>
                  void action(photo, "reject").catch((error) =>
                    setMessage(error.message),
                  )
                }
              >
                Reject
              </button>
              <a
                className="button button-outline-navy"
                href={`/api/admin/photos/${photo.id}/download`}
              >
                <Download className="size-4" aria-hidden="true" />
                Original
              </a>
              <button
                className="button button-outline-navy"
                disabled={busy}
                aria-label="Delete photograph"
                onClick={() => void remove(photo)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
