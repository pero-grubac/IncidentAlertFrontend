import { placeName, reverseGeocode, searchPlaces } from "./geocoding";

function mockFetch(body, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body });
}

describe("placeName", () => {
  it("prefers street and city over the long display name", () => {
    expect(
      placeName({
        display_name: "12, Kralja Petra I, Centar, Banja Luka, Republika Srpska, Bosnia and Herzegovina",
        address: { road: "Kralja Petra I", house_number: "12", city: "Banja Luka" },
      }),
    ).toBe("Kralja Petra I 12, Banja Luka");
  });

  it("uses the place's own name when it has one", () => {
    expect(placeName({ name: "Kastel", display_name: "…", address: { city: "Banja Luka" } })).toBe("Kastel, Banja Luka");
  });

  it("does not repeat a city that is also the name", () => {
    expect(placeName({ name: "Tuzla", display_name: "Tuzla, BiH", address: { city: "Tuzla" } })).toBe("Tuzla");
  });

  it("falls back to the display name", () => {
    expect(placeName({ display_name: "Somewhere far away" })).toBe("Somewhere far away");
  });
});

describe("searchPlaces", () => {
  it("does not call the service for empty text", async () => {
    const fetch = mockFetch([]);
    expect(await searchPlaces("   ")).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps the results to places", async () => {
    const fetch = mockFetch([
      { name: "Mostar", display_name: "Mostar, Bosnia and Herzegovina", lat: "43.34", lon: "17.80", address: { city: "Mostar" } },
    ]);

    const places = await searchPlaces("Mostar");

    expect(places).toEqual([{ name: "Mostar", description: "Mostar, Bosnia and Herzegovina", latitude: 43.34, longitude: 17.8 }]);
    expect(fetch.mock.calls[0][0]).toContain("/search?");
    expect(fetch.mock.calls[0][0]).toContain("q=Mostar");
  });
});

describe("reverseGeocode", () => {
  it("keeps the exact clicked coordinates", async () => {
    mockFetch({ display_name: "Trg Krajine, Banja Luka", lat: "44.7", lon: "17.1", address: { road: "Trg Krajine", city: "Banja Luka" } });

    const place = await reverseGeocode(44.77222, 17.19111);

    expect(place).toEqual({ name: "Trg Krajine, Banja Luka", description: "Trg Krajine, Banja Luka", latitude: 44.77222, longitude: 17.19111 });
  });

  it("falls back to coordinates when the lookup fails", async () => {
    mockFetch({}, false);

    const place = await reverseGeocode(44.5, 18.25);

    expect(place.name).toBe("44.50000, 18.25000");
  });
});
