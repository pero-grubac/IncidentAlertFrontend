import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import ReportIncidentDialog from "./ReportIncidentDialog";
import * as incidentsApi from "../api/incidents";

const place = { name: "Trg Krajine, Banja Luka", latitude: 44.7722, longitude: 17.191 };
const categories = [
  { id: 1, name: "Fire" },
  { id: 3, name: "Traffic" },
];

function setup(props = {}) {
  const onClose = vi.fn();
  const onReported = vi.fn();
  renderWithProviders(
    <ReportIncidentDialog open place={place} categories={categories} onClose={onClose} onReported={onReported} {...props} />,
  );
  return { onClose, onReported };
}

describe("ReportIncidentDialog", () => {
  it("shows where the report will be filed", () => {
    setup();
    expect(screen.getByText("Trg Krajine, Banja Luka")).toBeInTheDocument();
    expect(screen.getByText("44.77220, 17.19100")).toBeInTheDocument();
  });

  it("explains what is missing instead of sending an incomplete report", async () => {
    const report = vi.spyOn(incidentsApi, "reportIncident");
    setup();

    await userEvent.click(screen.getByRole("button", { name: "Send report" }));

    expect(await screen.findByText("Give the incident a short title.")).toBeInTheDocument();
    expect(screen.getByText("Describe what happened.")).toBeInTheDocument();
    expect(screen.getByText("Pick at least one category.")).toBeInTheDocument();
    expect(report).not.toHaveBeenCalled();
  });

  it("sends a complete report with photos and confirms it", async () => {
    const report = vi.spyOn(incidentsApi, "reportIncident").mockResolvedValue();
    const { onClose, onReported } = setup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Title/), "Fallen tree");
    await user.type(screen.getByLabelText(/What happened/), "A tree blocks the road.");
    await user.click(screen.getByRole("button", { name: "Traffic" }));
    await user.upload(screen.getByTestId("photo-input"), new File(["img"], "tree.jpg", { type: "image/jpeg" }));
    expect(screen.getByAltText("tree.jpg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send report" }));

    await waitFor(() => expect(report).toHaveBeenCalledTimes(1));
    const sent = report.mock.calls[0][0];
    expect(sent).toMatchObject({ title: "Fallen tree", text: "A tree blocks the road.", categories: ["Traffic"], location: place });
    expect(sent.images.map((f) => f.name)).toEqual(["tree.jpg"]);
    expect(await screen.findByText("Thanks! Your report was sent to the moderators.")).toBeInTheDocument();
    expect(onReported).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("refuses files that are not images", async () => {
    setup();

    await userEvent.upload(screen.getByTestId("photo-input"), new File(["%PDF"], "notes.pdf", { type: "application/pdf" }), {
      applyAccept: false,
    });

    expect(await screen.findByText("notes.pdf is not an image.")).toBeInTheDocument();
  });

  it("keeps the dialog open and tells the user when sending fails", async () => {
    vi.spyOn(incidentsApi, "reportIncident").mockRejectedValue({ code: "ERR_NETWORK" });
    const { onClose } = setup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Title/), "Gas leak");
    await user.type(screen.getByLabelText(/What happened/), "Smell of gas.");
    await user.click(screen.getByRole("button", { name: "Fire" }));
    await user.click(screen.getByRole("button", { name: "Send report" }));

    expect(await screen.findByText("The server cannot be reached right now.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
