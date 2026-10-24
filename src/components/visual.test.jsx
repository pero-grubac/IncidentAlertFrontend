import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import Gallery from "./Gallery";
import BottomSheet from "./BottomSheet";
import { sheetHeight } from "../lib/sheet";
import { categoryStyle, categoryTextColor } from "../lib/categories";
import { clusterIcon } from "./map/markers";

const photos = ["/a.jpg", "/b.jpg", "/c.jpg"];

describe("Gallery", () => {
  it("browses with the arrows, wrapping around", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Gallery images={photos} title="Flood" />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByAltText("Flood — photo 2")).toHaveAttribute("src", "/b.jpg");
    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("browses with the keyboard in full screen", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Gallery images={photos} title="Flood" />);

    await user.click(screen.getByRole("button", { name: "Open the photo in full size" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });

    expect(within(dialog).getByAltText("Flood — full size")).toHaveAttribute("src", "/b.jpg");
  });

  it("has no arrows for a single photo", () => {
    renderWithProviders(<Gallery images={["/a.jpg"]} title="Flood" />);
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
  });
});

describe("BottomSheet", () => {
  it("moves up a step on tap and down on a downward swipe", async () => {
    const onStepChange = vi.fn();
    const { unmount } = renderWithProviders(
      <BottomSheet step="peek" onStepChange={onStepChange} expandLabel="Show more" collapseLabel="Show less" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(onStepChange).toHaveBeenLastCalledWith("half");
    unmount();

    renderWithProviders(<BottomSheet step="half" onStepChange={onStepChange} expandLabel="Show more" collapseLabel="Show less" />);
    const handle = screen.getByRole("button", { name: "Show more" });
    fireEvent.touchStart(handle, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 420 }] });
    expect(onStepChange).toHaveBeenLastCalledWith("peek");
  });

  it("grows with each step", () => {
    expect(sheetHeight("peek", 800)).toBeLessThan(sheetHeight("half", 800));
    expect(sheetHeight("half", 800)).toBeLessThan(sheetHeight("full", 800));
  });
});

describe("contrast", () => {
  it("uses the darker shade for text on light backgrounds and the bright one in the dark theme", () => {
    expect(categoryTextColor("Traffic", "light")).toBe("#B45309");
    expect(categoryTextColor("Traffic", "dark")).toBe(categoryStyle("Traffic").color);
  });
});

describe("clusterIcon", () => {
  it("counts incidents, not places, and splits the ring by color", () => {
    const markers = [
      { options: { incidentCount: 3, color: "#EF4444" } },
      { options: { incidentCount: 1, color: "#3B82F6" } },
    ];
    const icon = clusterIcon({ getAllChildMarkers: () => markers }, (n) => `${n} places`);

    expect(icon.options.html).toContain(">4<");
    expect(icon.options.html).toContain("#EF4444 0deg 270deg");
    expect(icon.options.html).toContain('aria-label="2 places"');
  });
});
