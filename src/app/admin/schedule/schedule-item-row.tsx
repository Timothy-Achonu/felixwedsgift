import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { deleteScheduleItem, moveScheduleItem } from "../actions";
import { adminStyles } from "../admin-styles";
import { ScheduleItemForm } from "./schedule-form";
import type { AdminScheduleItem } from "./page";

function MoveButton({
  item,
  direction,
  adjacentItem,
}: {
  item: AdminScheduleItem;
  direction: "up" | "down";
  adjacentItem?: AdminScheduleItem;
}) {
  return (
    <form action={moveScheduleItem}>
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="direction" value={direction} />
      <input type="hidden" name="sort_order" value={item.sort_order} />
      <input type="hidden" name="adjacent_id" value={adjacentItem?.id ?? ""} />
      <input
        type="hidden"
        name="adjacent_sort_order"
        value={adjacentItem?.sort_order ?? ""}
      />
      <button
        className={adminStyles.iconButton}
        type="submit"
        disabled={!adjacentItem}
        aria-label={`Move ${item.title} ${direction}`}
      >
        {direction === "up" ? (
          <ArrowUp aria-hidden="true" size={16} />
        ) : (
          <ArrowDown aria-hidden="true" size={16} />
        )}
      </button>
    </form>
  );
}

export function ScheduleItemRow({
  item,
  previousItem,
  nextItem,
}: {
  item: AdminScheduleItem;
  previousItem?: AdminScheduleItem;
  nextItem?: AdminScheduleItem;
}) {
  return (
    <article className={adminStyles.scheduleCard}>
      <div className={adminStyles.scheduleCardHeader}>
        <div>
          <p className={adminStyles.eyebrow}>{item.time_label}</p>
          <h2 className={adminStyles.moduleHeading}>{item.title}</h2>
        </div>
        <div className={adminStyles.scheduleControls}>
          <MoveButton item={item} direction="up" adjacentItem={previousItem} />
          <MoveButton item={item} direction="down" adjacentItem={nextItem} />
          <form action={deleteScheduleItem}>
            <input type="hidden" name="id" value={item.id} />
            <button
              className={adminStyles.iconButton}
              type="submit"
              aria-label={`Delete ${item.title}`}
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </form>
        </div>
      </div>
      <ScheduleItemForm item={item} />
    </article>
  );
}
