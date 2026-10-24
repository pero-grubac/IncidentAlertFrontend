import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { AppearanceProvider } from "./context/AppearanceContext";
import { IncidentsProvider } from "./context/IncidentsContext";
import { NotificationProvider } from "./context/NotificationContext";
import MapPage from "./pages/MapPage";
import LocationPage from "./pages/LocationPage";
import { ROUTER_FUTURE } from "./router";

export default function App() {
  return (
    <I18nProvider>
      <AppearanceProvider>
        <NotificationProvider>
          <IncidentsProvider>
            <BrowserRouter future={ROUTER_FUTURE}>
              <Routes>
                <Route path="/" element={<MapPage />} />
                <Route path="/location/:locationName" element={<LocationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </IncidentsProvider>
        </NotificationProvider>
      </AppearanceProvider>
    </I18nProvider>
  );
}
