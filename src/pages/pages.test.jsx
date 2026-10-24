import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/render";
import { IncidentsProvider } from "../context/IncidentsContext";
import * as incidentsApi from "../api/incidents";
import * as categoriesApi from "../api/categories";
import MapPage from "./MapPage";
import LocationPage from "./LocationPage";

// Leaflet needs a real layout engine; the pages are tested around the map.
vi.mock("../components/map/IncidentMap", () => ({
  default: ({ incidents }) => <div data-testid="map">{incidents.length} on the map</div>,
}));
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="mini-map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
}));

const sarajevo = { id: 2, name: "Sarajevo", latitude: 43.8563, longitude: 18.4131 };
const now = Date.now();
const incidents = [
  { id: 1, title: "Forest fire", text: "Near the park.", dateTime: new Date(now - 2 * 864e5).toISOString(), location: sarajevo, categories: [{ id: 1, name: "Fire" }], images: [] },
  { id: 2, title: "Road flooding", text: "Main road.", dateTime: new Date(now - 4 * 864e5).toISOString(), location: sarajevo, categories: [{ id: 2, name: "Flood" }], images: [] },
];

beforeEach(() => {
  vi.spyOn(categoriesApi, "getCategories").mockResolvedValue([{ id: 1, name: "Fire" }, { id: 2, name: "Flood" }]);
});

describe("MapPage", () => {
  it("loads the last 30 days and lists them", async () => {
    const load = vi.spyOn(incidentsApi, "getIncidentsInRange").mockResolvedValue(incidents);

    renderWithProviders(
      <IncidentsProvider>
        <MapPage />
      </IncidentsProvider>,
    );

    expect(await screen.findByText("Forest fire")).toBeInTheDocument();
    expect(screen.getByText("Road flooding")).toBeInTheDocument();
    expect(screen.getByTestId("incident-count")).toHaveTextContent("2 incidents");
    const [start, end] = load.mock.calls[0];
    expect(end.diff(start, "day")).toBe(29);
  });

  it("hides a category from the list and the map", async () => {
    vi.spyOn(incidentsApi, "getIncidentsInRange").mockResolvedValue(incidents);
    renderWithProviders(
      <IncidentsProvider>
        <MapPage />
      </IncidentsProvider>,
    );
    await screen.findByText("Forest fire");

    await userEvent.click(screen.getByRole("button", { name: "Fire", pressed: true }));

    expect(screen.queryByText("Forest fire")).not.toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveTextContent("1 on the map");
  });

  it("explains an empty period", async () => {
    vi.spyOn(incidentsApi, "getIncidentsInRange").mockResolvedValue([]);
    renderWithProviders(
      <IncidentsProvider>
        <MapPage />
      </IncidentsProvider>,
    );

    expect(await screen.findByText("Nothing reported")).toBeInTheDocument();
  });

  it("shows an error when the API is down", async () => {
    vi.spyOn(incidentsApi, "getIncidentsInRange").mockRejectedValue({ code: "ERR_NETWORK" });
    renderWithProviders(
      <IncidentsProvider>
        <MapPage />
      </IncidentsProvider>,
    );

    expect(await screen.findByText("The server cannot be reached right now.")).toBeInTheDocument();
  });
});

describe("LocationPage", () => {
  const renderPage = () =>
    renderWithProviders(
      <Routes>
        <Route path="/location/:locationName" element={<LocationPage />} />
      </Routes>,
      { route: "/location/Sarajevo" },
    );

  it("lists the place's reports and filters them by category", async () => {
    const load = vi.spyOn(incidentsApi, "getIncidentsByLocation").mockResolvedValue(incidents);
    renderPage();

    expect(await screen.findByText("Forest fire")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith("Sarajevo");
    expect(screen.getByText("2 approved reports")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Flood", pressed: false }));

    await waitFor(() => expect(screen.queryByText("Forest fire")).not.toBeInTheDocument());
    expect(screen.getByText("Road flooding")).toBeInTheDocument();
  });

  it("invites the first report when the place has none", async () => {
    vi.spyOn(incidentsApi, "getIncidentsByLocation").mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No reports here yet")).toBeInTheDocument();
  });
});
