import React, { createContext, useContext, useState } from "react";
import { getIncidentsOnDate, getIncidentsInDateRange } from "../services/incidentService";

const IncidentContext = createContext();

export const useIncidents = () => useContext(IncidentContext);

export const IncidentProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidentsOnDate = async (date) => {
    try {
      const response = await getIncidentsOnDate(date);
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents on date", error);
    }
  };

  const fetchIncidentsInDateRange = async (startDate, endDate) => {
    try {
      const response = await getIncidentsInDateRange(startDate, endDate);
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents in date range", error);
    }
  };

  return (
    <IncidentContext.Provider value={{ incidents, fetchIncidentsOnDate, fetchIncidentsInDateRange }}>
      {children}
    </IncidentContext.Provider>
  );
};
