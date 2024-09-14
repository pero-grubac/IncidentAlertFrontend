import React, { useState, useRef, useEffect } from "react";
import { TextField, IconButton } from "@mui/material";
import "./Sidebar.css";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useSearch } from "../../context/SearchContext";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { searchTerm, setSearchTerm } = useSearch();
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const autocompleteRef = useRef(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      console.log(place);

      if (place && place.formatted_address) {
        setLocalSearchTerm(place.formatted_address);
        setSearchTerm(place.formatted_address);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
      libraries={["places"]}
    >
      <div className="container">
        <div style={{ width: isOpen ? "400px" : "50px" }} className="sidebar">
          <div className="top_section">
            <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
              Incident Alert
            </h1>
            <div
              style={{ marginLeft: isOpen ? "50px" : "0px" }}
              className="bars"
            >
              <MenuIcon onClick={toggle} />
            </div>
          </div>
          <div className="menuItems">
            <div className="searchBox">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton
                          edge="end"
                          color="inherit"
                          onClick={handleSearch}
                        >
                          <SearchIcon />
                        </IconButton>
                      ),
                    },
                  }}
                  sx={{ width: "100%" }}
                />
              </Autocomplete>
            </div>
          </div>
        </div>
        <main>{children}</main>
      </div>{" "}
    </LoadScript>
  );
};

export default Sidebar;
