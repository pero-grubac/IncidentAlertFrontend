import React, { useState } from "react";
import { TextField, IconButton } from "@mui/material";
import "./Sidebar.css";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useSearch } from "../../context/SearchContext"; 

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { setSearchTerm } = useSearch();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const handleSearch = () => {
    setSearchTerm(localSearchTerm); 
  };
  return (
    <div className="container">
      <div style={{ width: isOpen ? "400px" : "50px" }} className="sidebar">
        <div className="top_section">
          <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
            Incidnet Alert
          </h1>
          <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
            <MenuIcon onClick={toggle} />
          </div>
        </div>
        <div className="menuItems">
          <div className="searchBox">
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
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Sidebar;
