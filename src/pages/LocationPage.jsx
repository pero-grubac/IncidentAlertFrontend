import React, { useState, useEffect } from "react";
import FilterSection from "../components/FilterSection/FilterSection";
import IncidentCard from "../components/IncidentCard/IncidentCard";
import IncidentDetailsDialog from "../components/IncidentDetailsDialog/IncidentDetailsDialog";
import AddIncidentDialog from "../components/AddIncidentDialog/AddIncidentDialog";
import { Box, Grid, CircularProgress } from "@mui/material";
import {
  getIncidentsByLocationName,
  createIncident,
} from "../services/incident.service";
import { useParams } from "react-router-dom";
import { getCategories } from "../services/category.service";
import { useLocation } from "react-router-dom";

const LocationPage = ({ locationId }) => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dateFilterStart, setDateFilterStart] = useState(null);
  const [dateFilterEnd, setDateFilterEnd] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [newIncidentText, setNewIncidentText] = useState("");
  const [newIncidentTitle, setNewIncidentTitle] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const { locationName } = useParams();
  const location = useLocation();
  const locationData = location.state?.location;
  useEffect(() => {
    // Fetch incidents and categories
    const fetchIncidents = async () => {
      try {
        const response = await getIncidentsByLocationName(locationName);
        const data = response.data;
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response.data;
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchIncidents();
    fetchCategories();
    console.log(incidents);
  }, [locationName]);

  const handleAddIncident = async () => {
    const incident = {
      id: 0,
      text: newIncidentText,
      title: newIncidentTitle,
      dateTime: new Date().toISOString(),
      location: locationData,
      categories: selectedCategories,
    };
    try {
      await createIncident(incident);
    } catch (error) {
      console.log(error.response || error.message);
    }
    setNewIncidentText("");
    setNewIncidentTitle("");

    setSelectedCategories([]);
    setIsAddIncidentOpen(false);
  };
  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <Box>
      <h1>Location: {locationName}</h1>
      <FilterSection
        dateFilterStart={dateFilterStart}
        setDateFilterStart={setDateFilterStart}
        dateFilterEnd={dateFilterEnd}
        setDateFilterEnd={setDateFilterEnd}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onAddClick={() => setIsAddIncidentOpen(true)}
      />

      <Grid container spacing={2}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          incidents
            .filter((incident) => {
              const matchesDate =
                (!dateFilterStart ||
                  new Date(incident.dateTime) >= new Date(dateFilterStart)) &&
                (!dateFilterEnd ||
                  new Date(incident.dateTime) <= new Date(dateFilterEnd));
              const matchesCategory =
                !categoryFilter ||
                incident.categories.some((cat) => cat.name === categoryFilter);
              return matchesDate && matchesCategory;
            })
            .map((incident) => (
              <Grid item xs={12} sm={6} md={4} key={incident.id}>
                <IncidentCard
                  incident={incident}
                  onClick={() => handleIncidentClick(incident)}
                />
              </Grid>
            ))
        )}
      </Grid>

      <IncidentDetailsDialog
        open={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
      />

      <AddIncidentDialog
        open={isAddIncidentOpen}
        onClose={() => setIsAddIncidentOpen(false)}
        newIncidentText={newIncidentText}
        setNewIncidentText={setNewIncidentText}
        newIncidentTitle={newIncidentTitle}
        setNewIncidentTitle={setNewIncidentTitle}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        onAddIncident={handleAddIncident}
      />
    </Box>
  );
};

export default LocationPage;
