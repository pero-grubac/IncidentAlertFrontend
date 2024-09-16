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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const LocationPage = () => {
  const { locationName } = useParams();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dateFilterStart, setDateFilterStart] = useState(null);
  const [dateFilterEnd, setDateFilterEnd] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getByLocationName = async () => {
      try {
        const response = await getIncidentsByLocationName(locationName);
        const incidentsData = response.data;
        setIncidents(incidentsData);
        setFilteredIncidents(incidentsData);

        const catResponse = await getCategories();
        const catNames = catResponse.data.map((cat) => cat.name);
        setCategories(catNames);
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

  const handleCardClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleCloseDialog = () => {
    setSelectedIncident(null);
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
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </LocalizationProvider>
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
              flex: "0 1 80%",
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
              flex: "0 1 5%",
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
              flex: "0 1 5%",
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
              flex: "0 1 10%",
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
    </div>
  );
};

export default LocationPage;
