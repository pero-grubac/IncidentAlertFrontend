import dayjs from "dayjs";
import { api } from "./client";
import { getIncidentsByLocation, getIncidentsInRange, reportIncident } from "./incidents";

describe("incidents API", () => {
  it("asks for a date range in ISO format", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: [] });
    const start = dayjs("2026-05-01T00:00:00Z");
    const end = dayjs("2026-05-07T23:59:59Z");

    await getIncidentsInRange(start, end);

    expect(get).toHaveBeenCalledWith("/Incident/GetAllInDateRange", {
      params: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  });

  it("escapes the location name in the URL", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: [] });

    await getIncidentsByLocation("Trg Krajine 2/3, Banja Luka");

    expect(get).toHaveBeenCalledWith("/Incident/GetAllByLocationName/Trg%20Krajine%202%2F3%2C%20Banja%20Luka");
  });

  it("sends a report as multipart form data in the shape the API binds", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({});
    const photo = new File(["x"], "tree.jpg", { type: "image/jpeg" });

    await reportIncident({
      title: "Fallen tree",
      text: "Blocks the road",
      dateTime: dayjs("2026-05-01T10:00:00Z"),
      location: { name: "Banja Luka", latitude: 44.77, longitude: 17.19 },
      categories: ["Traffic", "Other"],
      images: [photo],
    });

    const [url, form] = post.mock.calls[0];
    expect(url).toBe("/Incident");
    expect(form.get("title")).toBe("Fallen tree");
    expect(form.get("dateTime")).toBe("2026-05-01T10:00:00.000Z");
    expect(form.get("location.id")).toBe("0");
    expect(form.get("location.name")).toBe("Banja Luka");
    expect(form.get("location.latitude")).toBe("44.77");
    expect(form.getAll("categories")).toEqual(["Traffic", "Other"]);
    expect(form.getAll("images")[0].name).toBe("tree.jpg");
  });
});
