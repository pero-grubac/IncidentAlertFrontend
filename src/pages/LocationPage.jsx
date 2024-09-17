import React, { useState, useEffect } from "react";
import FilterSection from "../components/FilterSection/FilterSection";
import IncidentCard from "../components/IncidentCard/IncidentCard";
import IncidentDetailsDialog from "../components/IncidentDetailsDialog/IncidentDetailsDialog";
import AddIncidentDialog from "../components/AddIncidentDialog/AddIncidentDialog";
import { Box, Grid, CircularProgress } from "@mui/material";
import { getIncidentsByLocationName } from "../services/incident.service";
import { useParams } from "react-router-dom";
import { getCategories } from "../services/category.service";

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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { locationName } = useParams();

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
  }, [locationName]);

  const handleAddIncident = async () => {
    const newIncident = {
      text: newIncidentText,
      dateTime: new Date().toISOString(),
      location: { id: locationId },
      categories: selectedCategories,
    };

    try {
      await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIncident),
      });
      setNewIncidentText("");
      setSelectedCategories([]);
      setIsAddIncidentOpen(false);
      // Refresh incidents list
      const response = await fetch(`/api/incidents?locationId=${locationId}`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to add incident", error);
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <Box>
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
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        onAddIncident={handleAddIncident}
      />
    </Box>
  );
};

export default LocationPage;
