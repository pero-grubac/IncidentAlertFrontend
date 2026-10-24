import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import IncidentCard from "./IncidentCard";
import IncidentDetailsDialog from "./IncidentDetailsDialog";
import RangeFilter from "./RangeFilter";
import { rangeFor } from "../lib/dates";

const incident = {
  id: 7,
  title: "Bridge closure",
  text: "The bridge is closed because of flooding.",
  dateTime: "2026-05-01T10:00:00Z",
  location: { name: "Tuzla", latitude: 44.5, longitude: 18.6 },
  categories: [{ id: 2, name: "Flood" }, { id: 3, name: "Traffic" }],
  images: ["http://localhost:5000/uploads/7/bridge.jpg", "http://localhost:5000/uploads/7/river.jpg"],
};

describe("IncidentCard", () => {
  it("shows the essentials and opens on click", async () => {
    const onClick = vi.fn();
    renderWithProviders(<IncidentCard incident={incident} onClick={onClick} />);

    expect(screen.getByText("Bridge closure")).toBeInTheDocument();
    expect(screen.getByText("Tuzla")).toBeInTheDocument();
    expect(screen.getByText("Flood")).toBeInTheDocument();
    expect(screen.getByText("Traffic")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // photo count

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(incident);
  });
});

describe("IncidentDetailsDialog", () => {
  it("shows the full report with its photos", async () => {
    renderWithProviders(<IncidentDetailsDialog incident={incident} open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("The bridge is closed because of flooding.")).toBeInTheDocument();
    expect(within(dialog).getByAltText("Bridge closure — photo 1")).toHaveAttribute("src", incident.images[0]);

    await userEvent.click(within(dialog).getByRole("button", { name: "Show photo 2" }));
    expect(within(dialog).getByAltText("Bridge closure — photo 2")).toHaveAttribute("src", incident.images[1]);
  });

  it("hides the language switch when translation is not configured", () => {
    renderWithProviders(<IncidentDetailsDialog incident={incident} open onClose={() => {}} />);
    expect(screen.queryByRole("group", { name: "Language" })).not.toBeInTheDocument();
  });

  it("closes", async () => {
    const onClose = vi.fn();
    renderWithProviders(<IncidentDetailsDialog incident={incident} open onClose={onClose} />);

    // Both the corner icon and the footer button close the dialog.
    const buttons = screen.getAllByRole("button", { name: "Close" });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) await userEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("RangeFilter", () => {
  it("switches to a quick period", async () => {
    const onChange = vi.fn();
    renderWithProviders(<RangeFilter value={{ key: "month", ...rangeFor(29) }} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "7 days" }));

    const [key, start, end] = onChange.mock.calls[0];
    expect(key).toBe("week");
    expect(end.diff(start, "day")).toBe(6);
  });

  it("only applies a custom period on request", async () => {
    const onChange = vi.fn();
    renderWithProviders(<RangeFilter value={{ key: "month", ...rangeFor(29) }} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Custom" }));
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Show this period" }));
    expect(onChange).toHaveBeenCalledWith("custom", expect.anything(), expect.anything());
  });
});
