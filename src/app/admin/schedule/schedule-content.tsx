"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminQueryError, AdminSkeleton } from "../admin-skeleton";
import { adminQueryKeys, fetchSchedule } from "../admin-queries";
import { adminStyles } from "../admin-styles";
import { ScheduleItemForm } from "./schedule-form";
import { ScheduleItemRow } from "./schedule-item-row";

export function ScheduleContent({
  saved,
  deleted,
  reordered,
  error,
}: {
  saved: boolean;
  deleted: boolean;
  reordered: boolean;
  error?: string;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminQueryKeys.schedule,
    queryFn: fetchSchedule,
  });

  useEffect(() => {
    if (saved || deleted || reordered) {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.schedule });
    }
  }, [deleted, queryClient, reordered, saved]);

  return (
    <section
      className={`${adminStyles.content} ${adminStyles.formContent}`}
      aria-labelledby="schedule-heading"
      aria-busy={query.isPending}
    >
      <div className={adminStyles.scheduleIntro}>
        <div className={adminStyles.contentIntro}>
          <p className={adminStyles.eyebrow}>Order of the day</p>
          <h1 id="schedule-heading" className={adminStyles.contentHeading}>
            Make room for joy.
          </h1>
          <p className={adminStyles.contentCopy}>
            Manage the timeline guests will see on the public wedding site.
            Changes save immediately.
          </p>
        </div>
        <a className={adminStyles.secondaryButton} href="#new-entry">
          <Plus aria-hidden="true" className="mr-2 inline size-4" />
          Add an entry
        </a>
      </div>

      {query.isPending ? <AdminSkeleton kind="schedule" /> : null}
      {query.isError && query.data === undefined ? (
        <AdminQueryError
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {!query.isPending && query.data !== undefined ? (
        <>
          {query.isError ? (
            <AdminQueryError
              message="The schedule could not be refreshed. Your current entries are still shown."
              onRetry={() => void query.refetch()}
            />
          ) : null}
          {saved || deleted || reordered ? (
            <p className={adminStyles.saveConfirmation}>
              <CheckCircle2 aria-hidden="true" size={17} /> Schedule updated.
            </p>
          ) : null}
          {error ? (
            <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
              We could not complete that schedule change. Please try again.
            </p>
          ) : null}
          {query.isFetching ? (
            <p className="text-wedding-navy/58 mt-4 text-xs" role="status">
              Refreshing schedule…
            </p>
          ) : null}

          <div className={adminStyles.scheduleList}>
            {query.data.map((item, index) => (
              <ScheduleItemRow
                key={item.id}
                item={item}
                previousItem={query.data[index - 1]}
                nextItem={query.data[index + 1]}
              />
            ))}
          </div>

          {!query.data.length ? (
            <p className={adminStyles.scheduleEmpty}>
              No schedule entries yet. Add the ceremony, portraits, reception,
              dinner, and dancing as the day takes shape.
            </p>
          ) : null}

          <div id="new-entry" className={adminStyles.scheduleCard}>
            <p className={adminStyles.eyebrow}>New entry</p>
            <ScheduleItemForm />
          </div>
        </>
      ) : null}
    </section>
  );
}
