// App.js
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MapComponent from "./components/MapComponent/MapComponent";
import { SearchProvider } from "./context/SearchContext";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LocationPage from "./pages/LocationPage";
const App = () => {
  return (
    <SearchProvider>
      <Router>
        <Sidebar>
          <Routes>
            {/* Početna stranica sa MapComponent */}
            <Route path="/" element={<MapComponent />} />
            {/* Stranica za prikaz lokacije */}
            <Route path="/location/:locationName" element={<LocationPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Sidebar>
      </Router>
    </SearchProvider>
  );
};

export default App;
