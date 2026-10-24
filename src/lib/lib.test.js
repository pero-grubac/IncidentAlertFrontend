import dayjs from "dayjs";
import { categoryNames, categoryStyle, incidentColor } from "./categories";
import { isWithin, rangeFor } from "./dates";
import { groupByLocation } from "./grouping";
import { emptyReport, validate } from "./report";

describe("categories", () => {
  it("gives the built-in categories their own colors, regardless of case", () => {
    expect(categoryStyle("Fire").color).toBe("#EF4444");
    expect(categoryStyle(" flood ").color).toBe("#3B82F6");
  });

  it("gives a new category a stable color", () => {
    expect(categoryStyle("Earthquake").color).toBe(categoryStyle("earthquake").color);
    expect(categoryStyle("Earthquake").color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("reads category names from strings and from objects", () => {
    expect(categoryNames({ categories: ["Fire", { id: 2, name: "Flood" }] })).toEqual(["Fire", "Flood"]);
    expect(categoryNames({})).toEqual([]);
  });

  it("colors an incident by its first category", () => {
    expect(incidentColor({ categories: [{ name: "Crime" }, { name: "Fire" }] })).toBe("#8B5CF6");
  });
});

describe("dates", () => {
  const now = dayjs("2026-05-10T15:30:00");

  it("builds whole-day ranges", () => {
    const { start, end } = rangeFor(6, now);
    expect(start.format("YYYY-MM-DD HH:mm")).toBe("2026-05-04 00:00");
    expect(end.format("YYYY-MM-DD HH:mm")).toBe("2026-05-10 23:59");
  });

  it("checks a date against an optional range, including both ends", () => {
    expect(isWithin("2026-05-04T08:00:00", dayjs("2026-05-04"), dayjs("2026-05-04"))).toBe(true);
    expect(isWithin("2026-05-03T23:00:00", dayjs("2026-05-04"), null)).toBe(false);
    expect(isWithin("2026-05-05T00:30:00", null, dayjs("2026-05-04"))).toBe(false);
    expect(isWithin("2026-05-05", null, null)).toBe(true);
  });
});

describe("groupByLocation", () => {
  it("puts incidents of the same place on one marker, newest first", () => {
    const sarajevo = { name: "Sarajevo", latitude: 43.85, longitude: 18.41 };
    const groups = groupByLocation([
      { id: 1, dateTime: "2026-05-01T10:00:00Z", location: sarajevo },
      { id: 2, dateTime: "2026-05-03T10:00:00Z", location: sarajevo },
      { id: 3, dateTime: "2026-05-02T10:00:00Z", location: { name: "Tuzla", latitude: 44.5, longitude: 18.6 } },
      { id: 4, dateTime: "2026-05-02T10:00:00Z", location: null },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].incidents.map((i) => i.id)).toEqual([2, 1]);
  });
});

describe("validate", () => {
  const valid = { ...emptyReport(), title: "Fallen tree", text: "Blocks the road", categories: ["Traffic"] };

  it("accepts a complete report", () => {
    expect(validate(valid)).toEqual({});
  });

  it("explains every missing field", () => {
    const errors = validate(emptyReport());
    expect(Object.keys(errors).sort()).toEqual(["categories", "text", "title"]);
  });

  it("rejects a time in the future and a very long title", () => {
    const errors = validate({ ...valid, title: "x".repeat(121), dateTime: dayjs().add(1, "day") });
    expect(errors.title).toBe("report.errors.titleLong");
    expect(errors.dateTime).toBe("report.errors.future");
  });
});
