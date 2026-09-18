"use client";

import { Download, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import type { AdminPhoto, GuestPhotoStatus } from "@/lib/photos/constants";
import { applyPhotoModeration } from "@/lib/photos/moderation-list";

export function PhotoModeration({
  initialPhotos,
  status,
}: {
  initialPhotos: AdminPhoto[];
  status: GuestPhotoStatus | "ALL";
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  function commitUpdates(
    updates: Array<{
      id: string;
      status?: AdminPhoto["status"];
      revision?: number;
      caption?: string | null;
    }>,
  ) {
    setPhotos((current) => applyPhotoModeration(current, status, updates));
    const dropped = new Set(
      updates
        .filter(
          (update) =>
            status !== "ALL" &&
            update.status !== undefined &&
            update.status !== status,
        )
        .map((update) => update.id),
    );
    if (dropped.size)
      setSelected((current) => current.filter((id) => !dropped.has(id)));
  }

  async function action(
    photo: AdminPhoto,
    operation: "approve" | "reject" | "caption",
    caption = photo.caption ?? "",
  ) {
    setPendingKey(`${operation}:${photo.id}`);
    try {
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
      commitUpdates([
        {
          id: photo.id,
          ...result.photo,
          caption:
            operation === "caption" ? caption.trim() || null : photo.caption,
        },
      ]);
      if (operation === "approve") toastSuccess("Photograph approved");
      else if (operation === "reject") toastSuccess("Photograph rejected");
      else toastSuccess("Caption saved");
    } catch (error) {
      toastError(
        error instanceof Error
          ? error.message
          : "The photograph could not be updated.",
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function bulk(operation: "approve" | "reject") {
    setBusy(true);
    setPendingKey(`bulk:${operation}`);
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
      commitUpdates(
        outcomes.flatMap((outcome) =>
          outcome.ok && outcome.photo
            ? [{ id: outcome.id, ...outcome.photo }]
            : [],
        ),
      );
      if (outcomes.length && outcomes.every(({ ok }) => ok))
        toastSuccess("Selected photographs updated.");
      else toastError("Some photographs could not be updated.");
    } catch (error) {
      toastError(
        error instanceof Error
          ? error.message
          : "Selected photographs could not be updated.",
      );
    } finally {
      setBusy(false);
      setPendingKey(null);
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
    setPendingKey(`delete:${photo.id}`);
    try {
      const response = await fetch(
        `/api/admin/photos/${photo.id}?revision=${photo.revision}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Deletion failed.");
      setPhotos((current) => current.filter(({ id }) => id !== photo.id));
      setSelected((current) => current.filter((id) => id !== photo.id));
      toastSuccess("Photograph deleted");
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Deletion failed.");
    } finally {
      setBusy(false);
      setPendingKey(null);
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
        <Button
          type="button"
          disabled={!selected.length || busy}
          isLoading={pendingKey === "bulk:approve"}
          onClick={() => void bulk("approve")}
        >
          {pendingKey === "bulk:approve" ? "Approving..." : "Approve selected"}
        </Button>
        <Button
          type="button"
          disabled={!selected.length || busy}
          isLoading={pendingKey === "bulk:reject"}
          onClick={() => void bulk("reject")}
        >
          {pendingKey === "bulk:reject" ? "Rejecting..." : "Reject selected"}
        </Button>
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
                disabled={busy || pendingKey !== null}
                onBlur={(event) => {
                  if (event.target.value.trim() !== (photo.caption ?? ""))
                    void action(photo, "caption", event.target.value);
                }}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busy || photo.status === "APPROVED"}
                isLoading={pendingKey === `approve:${photo.id}`}
                onClick={() => void action(photo, "approve")}
              >
                {pendingKey === `approve:${photo.id}`
                  ? "Approving..."
                  : "Approve"}
              </Button>
              <Button
                type="button"
                disabled={busy || photo.status === "REJECTED"}
                isLoading={pendingKey === `reject:${photo.id}`}
                onClick={() => void action(photo, "reject")}
              >
                {pendingKey === `reject:${photo.id}`
                  ? "Rejecting..."
                  : "Reject"}
              </Button>
              <Button asChild>
                <a href={`/api/admin/photos/${photo.id}/download`}>
                  <Download className="size-4" aria-hidden="true" />
                  Original
                </a>
              </Button>
              <Button
                type="button"
                disabled={busy}
                isLoading={pendingKey === `delete:${photo.id}`}
                aria-label="Delete photograph"
                onClick={() => void remove(photo)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
