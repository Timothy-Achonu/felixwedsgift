import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AdminDatePicker,
  AdminTimeSelect,
  composeDateTime,
  formatTimeLabel,
  parseTimeValue,
  splitDateTime,
  timeOptions,
} from "./date-time-picker";

describe("admin date and time controls", () => {
  it("provides five-minute time slots and preserves display labels", () => {
    expect(timeOptions).toHaveLength(288);
    expect(timeOptions[0]).toEqual({ value: "00:00", label: "12:00 AM" });
    expect(timeOptions.at(-1)).toEqual({ value: "23:55", label: "11:55 PM" });
    expect(parseTimeValue("2:00 PM")).toBe("14:00");
    expect(formatTimeLabel("14:00")).toBe("2:00 PM");
  });

  it("submits the selected time as the existing human-readable field value", () => {
    render(<AdminTimeSelect name="ceremony_time" defaultValue="2:00 PM" />);

    fireEvent.click(screen.getByRole("button", { name: /2:00 PM/i }));
    fireEvent.click(screen.getByRole("option", { name: "3:00 PM" }));

    expect(screen.getByRole("button", { name: /3:00 PM/i })).toBeVisible();
    expect(screen.getByDisplayValue("3:00 PM")).toHaveAttribute(
      "name",
      "ceremony_time",
    );
  });

  it("only commits a calendar draft after Apply", () => {
    render(<AdminDatePicker name="wedding_day" defaultValue="2026-12-18" />);

    fireEvent.click(screen.getByRole("button", { name: "18 Dec 2026" }));
    fireEvent.click(screen.getByRole("gridcell", { name: "20" }));
    expect(screen.getByRole("gridcell", { name: "20" })).toHaveClass(
      "!text-wedding-cream",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByDisplayValue("2026-12-18")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "18 Dec 2026" }));
    fireEvent.click(screen.getByRole("gridcell", { name: "20" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByDisplayValue("2026-12-20")).toBeInTheDocument();
  });

  it("keeps the existing datetime-local submission shape", () => {
    expect(splitDateTime("2026-12-18T14:00:00+01:00")).toEqual({
      date: "2026-12-18",
      time: "13:00",
    });
    expect(composeDateTime("2026-12-18", "13:00")).toBe("2026-12-18T13:00");
  });
});
