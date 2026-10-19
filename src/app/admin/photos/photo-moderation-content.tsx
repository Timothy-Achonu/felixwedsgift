"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { GuestPhotoStatus } from "@/lib/photos/constants";

import { AdminQueryError, AdminSkeleton } from "../admin-skeleton";
import {
  adminQueryKeys,
  fetchAdminPhotoPage,
  type AdminPhotoCursor,
} from "../admin-queries";
import { adminStyles } from "../admin-styles";
import { PhotoModeration } from "./photo-moderation";

const statuses = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

export function PhotoModerationContent({
  initialStatus,
}: {
  initialStatus: GuestPhotoStatus | "ALL";
}) {
  return (
    <PhotoModerationStatus key={initialStatus} initialStatus={initialStatus} />
  );
}

function PhotoModerationStatus({
  initialStatus,
}: {
  initialStatus: GuestPhotoStatus | "ALL";
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(initialStatus);
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.photoStatus(status),
    queryFn: ({ pageParam }) => fetchAdminPhotoPage(status, pageParam),
    initialPageParam: null as AdminPhotoCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const photos = useMemo(
    () => query.data?.pages.flatMap((page) => page.photos) ?? [],
    [query.data],
  );

  function selectStatus(nextStatus: GuestPhotoStatus | "ALL") {
    setStatus(nextStatus);
  }

  function refreshPhotoLists() {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.photos });
  }

  return (
    <>
      <nav className="mt-10 flex flex-wrap gap-2" aria-label="Photo status">
        {statuses.map((item) => (
          <Link
            key={item}
            href={`/admin/photos?status=${item}`}
            className={`${adminStyles.secondaryButton} ${status === item ? adminStyles.secondaryButtonActive : ""}`}
            aria-current={status === item ? "page" : undefined}
            onClick={(event) => {
              if (
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                selectStatus(item);
              }
            }}
          >
            {item.toLowerCase()}
          </Link>
        ))}
      </nav>

      {query.isPending ? <AdminSkeleton kind="photos" /> : null}
      {query.isError && !query.data ? (
        <AdminQueryError
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data ? (
        <>
          {query.isError && !query.isFetchNextPageError ? (
            <AdminQueryError
              message="Photographs could not be refreshed. The last loaded results are still shown."
              onRetry={() => void query.refetch()}
            />
          ) : null}
          {query.isFetching && !query.isFetchingNextPage ? (
            <p className="text-wedding-navy/58 mt-4 text-xs" role="status">
              Refreshing photographs…
            </p>
          ) : null}
          <PhotoModeration
            key={status}
            status={status}
            initialPhotos={photos}
            onDataChanged={refreshPhotoLists}
          />
          {query.isFetchNextPageError ? (
            <AdminQueryError
              message="We could not load more photographs. Please try again."
              onRetry={() => void query.fetchNextPage()}
            />
          ) : null}
          {query.hasNextPage ? (
            <button
              type="button"
              className={`${adminStyles.secondaryButton} mt-6`}
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Loading…" : "Load more photographs"}
            </button>
          ) : null}
        </>
      ) : null}
    </>
  );
}
