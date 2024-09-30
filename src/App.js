import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MapComponent from "./components/MapComponent/MapComponent";
import LeafletMapComponent from "./components/MapComponent/LeafletMapComponent";
import NominatimSidebar from "./components/Sidebar/NominatimSidebar";
import { SearchProvider } from "./context/SearchContext";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LocationPage from "./pages/LocationPage";
import { IncidentProvider } from "./context/IncidentContext";

const App = () => {
  return (
    <SearchProvider>
      <IncidentProvider>
        <Router>
          <Sidebar>
            <Routes>
              {/* Početna stranica sa MapComponent */}
              <Route path="/" element={<LeafletMapComponent />} />
              {/* Stranica za prikaz lokacije */}
              <Route
                path="/location/:locationName"
                element={<LocationPage />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Sidebar>
        </Router>
      </IncidentProvider>
    </SearchProvider>
  );
};

export default App;
