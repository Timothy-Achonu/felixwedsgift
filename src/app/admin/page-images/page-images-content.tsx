"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { pageImageSlots, type PageImageSlot } from "@/data/page-images";
import type { WeddingPhoto } from "@/types/wedding";

import { AdminQueryError, AdminSkeleton } from "../admin-skeleton";
import { adminQueryKeys, fetchPageImages } from "../admin-queries";
import { adminStyles } from "../admin-styles";
import { PageImageEditor } from "./page-image-editor";

export function PageImagesContent({
  configured,
  fallbacks,
}: {
  configured: boolean;
  fallbacks: Record<PageImageSlot, WeddingPhoto>;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminQueryKeys.pageImages,
    queryFn: fetchPageImages,
    enabled: configured,
  });

  if (!configured) {
    return (
      <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
        Set the Cloudinary cloud name, API key and API secret before uploading
        page images.
      </p>
    );
  }
  if (query.isPending) return <AdminSkeleton kind="page-images" />;
  if (query.isError && query.data === undefined) {
    return (
      <AdminQueryError
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const images = new Map(query.data.map((row) => [row.slot, row]));

  return (
    <>
      {query.isError ? (
        <AdminQueryError
          message="Page images could not be refreshed. Your current images are still shown."
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isFetching ? (
        <p className="text-wedding-navy/58 mt-4 text-xs" role="status">
          Refreshing page images…
        </p>
      ) : null}
      <PageImageEditor
        onSaved={() =>
          void queryClient.invalidateQueries({
            queryKey: adminQueryKeys.pageImages,
          })
        }
        entries={pageImageSlots.map((slot) => ({
          slot,
          image: images.get(slot) ?? null,
          fallback: fallbacks[slot],
        }))}
      />
    </>
  );
}
