import { CheckCircle2, Plus } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminShell } from "../admin-shell";
import { adminStyles } from "../admin-styles";
import { ScheduleItemForm, type ScheduleItemFormValues } from "./schedule-form";
import { ScheduleItemRow } from "./schedule-item-row";

export type AdminScheduleItem = ScheduleItemFormValues & {
  id: string;
  sort_order: number;
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    reordered?: string;
    error?: string;
  }>;
}) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id, time_label, title, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const params = await searchParams;
  const items = (data ?? []) as AdminScheduleItem[];

  return (
    <AdminShell activeSection="schedule">
      <section
        className={`${adminStyles.content} ${adminStyles.formContent}`}
        aria-labelledby="schedule-heading"
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

        {error ? (
          <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
            The schedule table is not available yet. Apply the Supabase content
            migration, then reload this page.
          </p>
        ) : (
          <>
            {params.saved || params.deleted || params.reordered ? (
              <p className={adminStyles.saveConfirmation}>
                <CheckCircle2 aria-hidden="true" size={17} /> Schedule updated.
              </p>
            ) : null}
            {params.error ? (
              <p
                className={`${adminStyles.formError} ${adminStyles.pageError}`}
              >
                We could not complete that schedule change. Please try again.
              </p>
            ) : null}

            <div className={adminStyles.scheduleList}>
              {items.map((item, index) => (
                <ScheduleItemRow
                  key={item.id}
                  item={item}
                  previousItem={items[index - 1]}
                  nextItem={items[index + 1]}
                />
              ))}
            </div>

            {!items.length ? (
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
        )}
      </section>
    </AdminShell>
  );
}
