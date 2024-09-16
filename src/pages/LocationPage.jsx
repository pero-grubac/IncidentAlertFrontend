import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getIncidentsByLocationName } from "../services/incident.service";
import { getCategories } from "../services/category.service";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Button,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useLocation } from "react-router-dom";

const LocationPage = () => {
  const { locationName } = useParams();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dateFilterStart, setDateFilterStart] = useState(null);
  const [dateFilterEnd, setDateFilterEnd] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newIncidentText, setNewIncidentText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const location = useLocation();
  const locationData = location.state?.location;

  useEffect(() => {
    const getByLocationName = async () => {
      try {
        const response = await getIncidentsByLocationName(locationName);
        const incidentsData = response.data;
        setIncidents(incidentsData);
        setFilteredIncidents(incidentsData);

        const catResponse = await getCategories();
        setCategories(catResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    getByLocationName();
  }, [locationName]);

  useEffect(() => {
    // Apply filters
    const filtered = incidents.filter((incident) => {
      const incidentDate = new Date(incident.dateTime);
      const matchesDateRange =
        dateFilterStart && dateFilterEnd
          ? incidentDate >= dateFilterStart && incidentDate <= dateFilterEnd
          : true;
      const matchesCategory = categoryFilter
        ? incident.categories.some((cat) => cat.name === categoryFilter)
        : true;
      return matchesDateRange && matchesCategory;
    });
    setFilteredIncidents(filtered);
  }, [dateFilterStart, dateFilterEnd, categoryFilter, incidents]);

  useEffect(() => {
    if (openAddDialog) {
      // Postavi fokus na dijalog kada se otvori
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.focus();
      }
    }
  }, [openAddDialog]);
  const handleCardClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleCloseDialog = () => {
    setSelectedIncident(null);
  };
  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };
  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
    setNewIncidentText("");
  };
  
  const handleAddIncident = () => {
    console.log("Adding incident:", {
      text: newIncidentText,
      categories: selectedCategories,
      location: locationData,
      datetime: new Date().toISOString(), 
    });
    handleAddDialogClose();
  };

  const handleCategoryChange = (event) => {
    const selectedValues = event.target.value;
    const selectedObjects = categories.filter((cat) =>
      selectedValues.includes(cat.name)
    );
    setSelectedCategories(selectedObjects);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h1>Location: {locationName}</h1>

      {/* Filter Section */}
      <Box sx={{ padding: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid item xs={12} sm={4} md={3}>
              <DatePicker
                slotProps={{
                  actionBar: {
                    actions: ["clear"],
                  },
                }}
                label="Start Date"
                value={dateFilterStart}
                onChange={(newValue) => setDateFilterStart(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <DatePicker
                slotProps={{
                  actionBar: {
                    actions: ["clear"],
                  },
                }}
                label="End Date"
                value={dateFilterEnd}
                onChange={(newValue) => setDateFilterEnd(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
              <FormControl fullWidth size="small">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                  sx={{ width: "100%", marginTop: 1, marginBottom: 1 }} // Add marginTop and marginBottom
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </LocalizationProvider>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDialogOpen}
          sx={{ height: "fit-content" }}
        >
          Add
        </Button>
      </Box>

      {/* Display filtered incidents */}
      {filteredIncidents.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center">
          No incidents
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredIncidents.map((incident) => (
            <Grid item xs={12} sm={6} md={4} key={incident.id}>
              <Card
                onClick={() => handleCardClick(incident)}
                style={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    component="div"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      WebkitLineClamp: 1,
                    }}
                  >
                    {incident.text}
                  </Typography>
                  <Typography color="text.secondary">
                    {new Date(incident.dateTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Location: {incident.location?.name}
                  </Typography>
                  <Typography variant="body2">
                    Categories:{" "}
                    {incident.categories.map((cat) => cat.name).join(", ")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Incident Details Dialog */}
      <Dialog
        open={Boolean(selectedIncident)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "500px",
            padding: 0,
          }}
        >
          {/* Text Section */}
          <Box
            sx={{
              flex: "1",
              padding: 2,
              borderBottom: "1px solid #ddd",
              overflowY: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="h6" component="div">
              {selectedIncident?.text}
            </Typography>
          </Box>

          {/* Date Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography color="text.secondary">
              {new Date(selectedIncident?.dateTime).toLocaleString()}
            </Typography>
          </Box>

          {/* Location Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography variant="body2">
              Location: {selectedIncident?.location?.name}
            </Typography>
          </Box>

          {/* Categories Section */}
          <Box
            sx={{
              padding: 2,
              overflowY: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="body2">
              Categories:{" "}
              {selectedIncident?.categories.map((cat) => cat.name).join(", ")}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add Incident Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleAddDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 2,
            height: "500px",
          }}
        >
          {/* Text Section */}
          <Box
            sx={{
              flex: "1",
              marginBottom: 2,
            }}
          >
            <TextField
              fullWidth
              label="Incident Text"
              multiline
              minRows={10} // Set minimum rows to control height
              maxRows={10} // Optional: limit maximum rows
              value={newIncidentText}
              onChange={(e) => setNewIncidentText(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  // Ensure TextField expands with the container
                  height: "100%",
                  minHeight: "150px", // Adjust as needed
                },
                "& .MuiFormControl-root": {
                  // Remove margin and padding issues
                  margin: 0,
                  padding: 0,
                },
              }}
            />
          </Box>

          {/* Date Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography color="text.secondary">
              Date: {new Date().toLocaleString()} {/* Add "Date" label */}
            </Typography>
          </Box>

          {/* Location Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography variant="body2">
              Location: {locationName} {/* Add "Location" label */}
            </Typography>
          </Box>

          {/* Category Section */}
          <Box
            sx={{
              marginBottom: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={selectedCategories.map((cat) => cat.name)} // Display selected category names
                onChange={handleCategoryChange} // Use the updated function
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Typography key={value}>{value}</Typography>
                    ))}
                  </Box>
                )}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Select Categories</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    <Checkbox
                      checked={selectedCategories.some(
                        (cat) => cat.name === category.name
                      )}
                    />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleAddDialogClose} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddIncident}
              sx={{ marginLeft: 2 }}
            >
              Add Incident
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationPage;
