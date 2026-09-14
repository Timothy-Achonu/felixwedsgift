"use client";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { adminStyles } from "../admin-styles";

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_SLOT = 5;

export type TimeOption = {
  value: string;
  label: string;
};

export const timeOptions: TimeOption[] = Array.from(
  { length: MINUTES_PER_DAY / MINUTES_PER_SLOT },
  (_, index) => {
    const totalMinutes = index * MINUTES_PER_SLOT;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    return { value, label: formatTimeLabel(value) };
  },
);

function parse24HourTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) return null;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseTimeValue(value: string | null | undefined) {
  if (!value) return null;

  const twentyFourHourValue = parse24HourTime(value);
  if (twentyFourHourValue) return twentyFourHourValue;

  const match = value
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::([0-5]\d))?\s*([ap])\.?m\.?$/);
  if (!match) return null;

  const rawHours = Number(match[1]);
  if (rawHours < 1 || rawHours > 12) return null;

  const minutes = match[2] ?? "00";
  const isAfternoon = match[3] === "p";
  const hours = (rawHours % 12) + (isAfternoon ? 12 : 0);
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function formatTimeLabel(value: string) {
  const parsed = parse24HourTime(value);
  if (!parsed) return value;

  const [rawHours, minutes] = parsed.split(":").map(Number);
  const period = rawHours < 12 ? "AM" : "PM";
  const hours = rawHours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function normalizeTimeValue(value: string | null | undefined) {
  return parseTimeValue(value) ?? value?.trim() ?? "";
}

function dateParts(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(year, month - 1, day);

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function localDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(value: string) {
  const parts = dateParts(value);
  if (!parts) return "Select date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parts.year, parts.month - 1, parts.day));
}

export function splitDateTime(value?: string | null) {
  if (!value) return { date: "", time: "" };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "" };

  const iso = parsed.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

export function composeDateTime(date: string, time: string) {
  return date && time ? `${date}T${time}` : "";
}

function useDismissablePopover(
  isOpen: boolean,
  setIsOpen: (next: boolean) => void,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isOpen, setIsOpen]);
}

export function AdminTimeSelect({
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "Select time",
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    normalizeTimeValue(defaultValue),
  );
  const selectedValue = normalizeTimeValue(
    isControlled ? value : internalValue,
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissablePopover(isOpen, setIsOpen, containerRef);

  const options = useMemo(() => {
    if (
      !selectedValue ||
      timeOptions.some((option) => option.value === selectedValue)
    ) {
      return timeOptions;
    }

    return [
      {
        value: selectedValue,
        label: formatTimeLabel(selectedValue),
      },
      ...timeOptions,
    ];
  }, [selectedValue]);

  const selectedLabel = selectedValue
    ? formatTimeLabel(selectedValue)
    : placeholder;

  const handleChange = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={adminStyles.pickerField}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={
            selectedValue && parseTimeValue(selectedValue)
              ? formatTimeLabel(selectedValue)
              : selectedValue
          }
        />
      ) : null}
      <button
        type="button"
        className={`${adminStyles.pickerTrigger} ${!selectedValue ? adminStyles.pickerTriggerPlaceholder : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Clock aria-hidden="true" size={17} />
        <span>{selectedLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={adminStyles.pickerChevron}
          size={16}
        />
      </button>
      {isOpen ? (
        <div
          className={adminStyles.timePopover}
          role="listbox"
          aria-label={placeholder}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${adminStyles.timeOption} ${option.value === selectedValue ? adminStyles.timeOptionSelected : ""}`}
              role="option"
              aria-selected={option.value === selectedValue}
              onClick={() => handleChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminDatePicker({
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "Select date",
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selectedValue = isControlled ? (value ?? "") : internalValue;
  const selectedParts = dateParts(selectedValue);
  const today = new Date();
  const todayYear = today.getFullYear();
  const [viewYear, setViewYear] = useState(
    selectedParts?.year ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selectedParts?.month ? selectedParts.month - 1 : today.getMonth(),
  );
  const [draftValue, setDraftValue] = useState(selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissablePopover(isOpen, setIsOpen, containerRef);

  const yearOptions = useMemo(() => {
    const firstYear = Math.min(todayYear - 1, viewYear - 1);
    const lastYear = Math.max(todayYear + 10, viewYear + 1);
    return Array.from(
      { length: lastYear - firstYear + 1 },
      (_, index) => firstYear + index,
    );
  }, [todayYear, viewYear]);

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
      index < firstWeekday
        ? null
        : `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(index - firstWeekday + 1).padStart(2, "0")}`,
    );
  }, [viewMonth, viewYear]);

  const openPicker = () => {
    const nextParts = dateParts(selectedValue);
    const nextDate = nextParts ?? {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    setDraftValue(selectedValue);
    setViewYear(nextDate.year);
    setViewMonth(nextDate.month - 1);
    setIsOpen(true);
  };

  const selectMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const applyDate = () => {
    if (!dateParts(draftValue)) return;
    if (!isControlled) setInternalValue(draftValue);
    onChange?.(draftValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={adminStyles.pickerField}>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <button
        type="button"
        className={`${adminStyles.pickerTrigger} ${!selectedValue ? adminStyles.pickerTriggerPlaceholder : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={isOpen ? () => setIsOpen(false) : openPicker}
      >
        <Calendar aria-hidden="true" size={17} />
        <span>
          {selectedValue ? formatDateLabel(selectedValue) : placeholder}
        </span>
      </button>

      {isOpen ? (
        <div
          className={adminStyles.datePopover}
          role="dialog"
          aria-label={placeholder}
        >
          <div className={adminStyles.dateHeader}>
            <button
              type="button"
              className={adminStyles.pickerIconButton}
              aria-label="Previous month"
              onClick={() => selectMonth(-1)}
            >
              <ChevronLeft aria-hidden="true" size={17} />
            </button>
            <div className={adminStyles.dateHeadingControls}>
              <span className={adminStyles.dateMonthLabel}>
                {new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
                  new Date(viewYear, viewMonth, 1),
                )}
              </span>
              <select
                className={adminStyles.dateYearSelect}
                aria-label="Year"
                value={viewYear}
                onChange={(event) => setViewYear(Number(event.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={adminStyles.pickerIconButton}
              aria-label="Next month"
              onClick={() => selectMonth(1)}
            >
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </div>

          <div className={adminStyles.dateWeekdays} aria-hidden="true">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div
            className={adminStyles.dateGrid}
            role="grid"
            aria-label="Calendar"
          >
            {calendarDays.map((day, index) => {
              if (!day)
                return <span key={`empty-${index}`} aria-hidden="true" />;

              const isSelected = day === draftValue;
              const isToday = day === localDateValue(today);
              return (
                <button
                  key={day}
                  type="button"
                  className={`${adminStyles.dateDay} ${isSelected ? adminStyles.dateDaySelected : ""} ${isToday && !isSelected ? adminStyles.dateDayToday : ""}`}
                  role="gridcell"
                  aria-selected={isSelected}
                  onClick={() => setDraftValue(day)}
                >
                  {Number(day.slice(-2))}
                </button>
              );
            })}
          </div>

          <div className={adminStyles.pickerFooter}>
            <button
              type="button"
              className={adminStyles.pickerCancel}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={adminStyles.pickerApply}
              disabled={!dateParts(draftValue)}
              onClick={applyDate}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WeddingDateTimeField({
  name,
  value,
}: {
  name: string;
  value?: string | null;
}) {
  const [dateTime, setDateTime] = useState(() => splitDateTime(value));

  return (
    <div className={adminStyles.dateTimeField}>
      <input
        type="hidden"
        name={name}
        value={composeDateTime(dateTime.date, dateTime.time)}
      />
      <AdminDatePicker
        value={dateTime.date}
        onChange={(nextDate) =>
          setDateTime((current) => ({ ...current, date: nextDate }))
        }
        placeholder="Select date"
      />
      <AdminTimeSelect
        value={dateTime.time}
        onChange={(nextTime) =>
          setDateTime((current) => ({ ...current, time: nextTime }))
        }
        placeholder="Select time"
      />
    </div>
  );
}
