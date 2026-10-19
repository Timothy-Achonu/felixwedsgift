"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminQueryError, AdminSkeleton } from "../admin-skeleton";
import { adminQueryKeys, fetchWeddingSettings } from "../admin-queries";
import { adminStyles } from "../admin-styles";
import { WeddingSettingsForm } from "./settings-form";

export function DetailsContent({ saved }: { saved: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminQueryKeys.weddingSettings,
    queryFn: fetchWeddingSettings,
  });

  useEffect(() => {
    if (saved) {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.weddingSettings,
      });
    }
  }, [queryClient, saved]);

  if (query.isPending) return <AdminSkeleton kind="details" />;
  if (query.isError && query.data === undefined) {
    return (
      <AdminQueryError
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <>
      {query.isError ? (
        <AdminQueryError
          message="Wedding details could not be refreshed. Your current values are still shown."
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {saved ? (
        <p className={adminStyles.saveConfirmation}>
          <CheckCircle2 aria-hidden="true" size={17} /> Wedding details saved.
        </p>
      ) : null}
      {query.isFetching ? (
        <p className="text-wedding-navy/58 mt-4 text-xs" role="status">
          Refreshing wedding details…
        </p>
      ) : null}
      <WeddingSettingsForm settings={query.data} />
    </>
  );
}
