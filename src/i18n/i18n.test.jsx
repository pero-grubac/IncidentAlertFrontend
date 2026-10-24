import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import { translate } from ".";
import { messages } from "./messages";
import { categoryLabel } from "../lib/categories";
import SettingsMenu from "../components/SettingsMenu";
import CategoryChip from "../components/CategoryChip";
import { useT } from ".";

function keysOf(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isPlural = value && typeof value === "object" && "other" in value;
    return value && typeof value === "object" && !isPlural ? keysOf(value, path) : [path];
  });
}

function Probe() {
  const t = useT();
  return <p>{t("map.reported")}</p>;
}

describe("translations", () => {
  it("has every English text in Serbian too", () => {
    expect(keysOf(messages.sr).sort()).toEqual(keysOf(messages.en).sort());
  });

  it("uses the Serbian plural forms", () => {
    expect(translate("map.count", { n: 1 }, "sr")).toBe("1 incident");
    expect(translate("map.count", { n: 3 }, "sr")).toBe("3 incidenta");
    expect(translate("map.count", { n: 7 }, "sr")).toBe("7 incidenata");
    expect(translate("map.count", { n: 21 }, "sr")).toBe("21 incident");
    expect(translate("map.count", { n: 7 }, "en")).toBe("7 incidents");
  });

  it("fills placeholders and falls back to English for a missing text", () => {
    expect(translate("report.removePhoto", { name: "a.jpg" }, "sr")).toBe("Ukloni a.jpg");
    expect(translate("no.such.key", undefined, "sr")).toBe("no.such.key");
  });

  it("translates the built-in categories but keeps the ones moderators added", () => {
    expect(categoryLabel("Fire", "sr")).toBe("Požar");
    expect(categoryLabel("traffic", "sr")).toBe("Saobraćaj");
    expect(categoryLabel("Power outage", "sr")).toBe("Power outage");
  });

  it("renders in Serbian", () => {
    renderWithProviders(
      <>
        <Probe />
        <CategoryChip name="Flood" />
      </>,
      { language: "sr" },
    );

    expect(screen.getByText("Prijavljeni incidenti")).toBeInTheDocument();
    expect(screen.getByText("Poplava")).toBeInTheDocument();
  });
});

describe("SettingsMenu", () => {
  afterEach(() => localStorage.clear());

  it("switches the language and remembers it", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SettingsMenu />
        <Probe />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(within(screen.getByRole("group", { name: "Language" })).getByRole("button", { name: /Srpski/ }));

    expect(screen.getByText("Prijavljeni incidenti")).toBeInTheDocument();
    expect(localStorage.getItem("incident-alert.language")).toBe("sr");
    expect(document.documentElement.lang).toBe("sr");
  });

  it("switches to the dark theme and remembers it", async () => {
    const user = userEvent.setup();
    // No forced mode, so the saved preference decides.
    renderWithProviders(<SettingsMenu />, { mode: null });

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(within(screen.getByRole("group", { name: "Theme" })).getByRole("button", { name: /Dark/ }));

    expect(document.documentElement.dataset.mode).toBe("dark");
    expect(localStorage.getItem("incident-alert.theme")).toBe("dark");
  });
});
