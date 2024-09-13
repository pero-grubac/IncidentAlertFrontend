// App.js
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MapComponent from "./components/MapComponent/MapComponent";
import { SearchProvider } from "./context/SearchContext";

const App = () => {
  return (
    <SearchProvider>
      <Sidebar>
        <MapComponent />
      </Sidebar>
    </SearchProvider>
  );
};

export default App;
