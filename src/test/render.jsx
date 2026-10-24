import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "../i18n";
import { AppearanceProvider } from "../context/AppearanceContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ROUTER_FUTURE } from "../router";

/** Renders with the same providers the app uses, in English and the light theme unless asked otherwise. */
export function renderWithProviders(ui, { route = "/", routerState, language = "en", mode = "light" } = {}) {
  return render(
    <I18nProvider language={language}>
      <AppearanceProvider mode={mode}>
        <NotificationProvider>
          <MemoryRouter future={ROUTER_FUTURE} initialEntries={[{ pathname: route, state: routerState }]}>
            {ui}
          </MemoryRouter>
        </NotificationProvider>
      </AppearanceProvider>
    </I18nProvider>,
  );
}
