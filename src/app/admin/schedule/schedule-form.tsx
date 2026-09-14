"use client";

import { useActionState } from "react";

import { saveScheduleItem } from "../actions";
import { adminStyles } from "../admin-styles";
import { AdminTimeSelect } from "../fields/date-time-picker";

export type ScheduleItemFormValues = {
  time_label: string;
  title: string;
  description: string | null;
};

export function ScheduleItemForm({
  item,
}: {
  item?: ScheduleItemFormValues & { id: string; sort_order: number };
}) {
  const [state, formAction, isPending] = useActionState(saveScheduleItem, {});

  return (
    <form className={adminStyles.scheduleForm} action={formAction}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="sort_order" value={item?.sort_order ?? 0} />
      <div className={adminStyles.formGrid}>
        <label>
          <span>Time</span>
          <AdminTimeSelect
            name="time_label"
            defaultValue={item?.time_label}
            placeholder="Select time"
          />
        </label>
        <label>
          <span>Title</span>
          <input
            name="title"
            defaultValue={item?.title}
            placeholder="Ceremony"
            required
          />
        </label>
        <label className={adminStyles.fieldWide}>
          <span>
            Description <small>(optional)</small>
          </span>
          <textarea
            name="description"
            defaultValue={item?.description ?? ""}
            rows={3}
          />
        </label>
      </div>
      <div className={adminStyles.scheduleActions}>
        {state.error ? (
          <p className={adminStyles.formError}>{state.error}</p>
        ) : (
          <span />
        )}
        <button
          className={adminStyles.primaryButton}
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving…" : item ? "Save entry" : "Add entry"}
        </button>
      </div>
    </form>
  );
}
