"use client";

import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import {
  maximumPhotoBulkBatchSize,
  type AdminPhoto,
  type GuestPhotoStatus,
} from "@/lib/photos/constants";
import { applyPhotoModeration } from "@/lib/photos/moderation-list";

export function PhotoModeration({
  initialPhotos,
  status,
  onDataChanged,
}: {
  initialPhotos: AdminPhoto[];
  status: GuestPhotoStatus | "ALL";
  onDataChanged?: () => void;
}) {
  const [photoOverrides, setPhotoOverrides] = useState<
    Record<string, AdminPhoto>
  >({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const photos = useMemo(
    () =>
      initialPhotos.flatMap((photo) => {
        if (removedIds.has(photo.id)) return [];
        const override = photoOverrides[photo.id];
        return [
          override && override.revision > photo.revision ? override : photo,
        ];
      }),
    [initialPhotos, photoOverrides, removedIds],
  );
  const selectedPhotos = photos.filter((photo) => selected.includes(photo.id));

  function commitUpdates(
    updates: Array<{
      id: string;
      status?: AdminPhoto["status"];
      revision?: number;
      caption?: string | null;
    }>,
  ) {
    const nextPhotos = applyPhotoModeration(photos, status, updates);
    const nextById = new Map(nextPhotos.map((photo) => [photo.id, photo]));
    setPhotoOverrides((current) => {
      const next = { ...current };
      for (const update of updates) {
        const photo = nextById.get(update.id);
        if (photo) next[update.id] = photo;
      }
      return next;
    });
    setRemovedIds((current) => {
      const next = new Set(current);
      for (const update of updates) {
        if (!nextById.has(update.id)) next.add(update.id);
      }
      return next;
    });
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
      onDataChanged?.();
    }
  }

  async function bulk(operation: "approve" | "reject" | "delete") {
    const targets = selectedPhotos;
    if (!targets.length) return;
    if (operation === "delete") {
      const noun = targets.length === 1 ? "photograph" : "photographs";
      if (
        !window.confirm(
          `Permanently delete ${targets.length} selected ${noun}? This cannot be undone.`,
        )
      )
        return;
    }

    setBusy(true);
    setPendingKey(`bulk:${operation}`);
    const successfulIds: string[] = [];
    const failedIds: string[] = [];
    const updates: Array<{
      id: string;
      revision: number;
      status: AdminPhoto["status"];
    }> = [];
    try {
      for (
        let start = 0;
        start < targets.length;
        start += maximumPhotoBulkBatchSize
      ) {
        const batch = targets.slice(start, start + maximumPhotoBulkBatchSize);
        try {
          const response = await fetch("/api/admin/photos/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: operation,
              photos: batch.map(({ id, revision }) => ({ id, revision })),
            }),
          });
          const result = (await response.json()) as {
            error?: string;
            results?: Array<{
              id: string;
              ok: boolean;
              photo?: { revision: number; status: AdminPhoto["status"] };
            }>;
          };
          if (!Array.isArray(result.results))
            throw new Error(result.error ?? "The selected photographs failed.");

          const outcomes = new Map(
            result.results.map((outcome) => [outcome.id, outcome]),
          );
          for (const photo of batch) {
            const outcome = outcomes.get(photo.id);
            if (!outcome?.ok) {
              failedIds.push(photo.id);
              continue;
            }
            if (operation === "delete") {
              successfulIds.push(photo.id);
              continue;
            }
            if (!outcome.photo) {
              failedIds.push(photo.id);
              continue;
            }
            successfulIds.push(photo.id);
            updates.push({ id: photo.id, ...outcome.photo });
          }
        } catch {
          failedIds.push(...targets.slice(start).map(({ id }) => id));
          break;
        }
      }

      if (updates.length) commitUpdates(updates);
      if (operation === "delete" && successfulIds.length) {
        setRemovedIds((current) =>
          new Set([...current, ...successfulIds]),
        );
      }
      setSelected(failedIds);

      const successCount = successfulIds.length;
      const failureCount = failedIds.length;
      if (operation === "delete") {
        if (!failureCount) {
          toastSuccess(
            `${successCount} photograph${successCount === 1 ? "" : "s"} deleted`,
          );
        } else {
          toastError(
            `${failureCount} photograph${failureCount === 1 ? "" : "s"} could not be deleted`,
            successCount
              ? `${successCount} deleted. Failed photographs remain selected.`
              : "Failed photographs remain selected for retry.",
          );
        }
      } else if (!failureCount) {
        toastSuccess(
          `${successCount} selected photograph${successCount === 1 ? "" : "s"} ${operation === "approve" ? "approved" : "rejected"}.`,
        );
      } else {
        toastError(
          `${failureCount} photograph${failureCount === 1 ? "" : "s"} could not be updated`,
          successCount
            ? `${successCount} updated. Failed photographs remain selected.`
            : "Failed photographs remain selected for retry.",
        );
      }
    } finally {
      setBusy(false);
      setPendingKey(null);
      onDataChanged?.();
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
      setRemovedIds((current) => new Set(current).add(photo.id));
      setSelected((current) => current.filter((id) => id !== photo.id));
      toastSuccess("Photograph deleted");
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Deletion failed.");
    } finally {
      setBusy(false);
      setPendingKey(null);
      onDataChanged?.();
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
          {selectedPhotos.length} selected
        </span>
        <Button
          type="button"
          disabled={busy || selectedPhotos.length === photos.length}
          onClick={() => setSelected(photos.map(({ id }) => id))}
        >
          Select loaded
        </Button>
        <Button
          type="button"
          disabled={busy || !selected.length}
          onClick={() => setSelected([])}
        >
          Clear selection
        </Button>
        <Button
          type="button"
          disabled={!selectedPhotos.length || busy}
          isLoading={pendingKey === "bulk:approve"}
          onClick={() => void bulk("approve")}
        >
          {pendingKey === "bulk:approve" ? "Approving..." : "Approve selected"}
        </Button>
        <Button
          type="button"
          disabled={!selectedPhotos.length || busy}
          isLoading={pendingKey === "bulk:reject"}
          onClick={() => void bulk("reject")}
        >
          {pendingKey === "bulk:reject" ? "Rejecting..." : "Reject selected"}
        </Button>
        <Button
          type="button"
          disabled={!selectedPhotos.length || busy}
          isLoading={pendingKey === "bulk:delete"}
          onClick={() => void bulk("delete")}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {pendingKey === "bulk:delete" ? "Deleting..." : "Delete selected"}
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
                disabled={busy}
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
