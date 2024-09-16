import base from "./baseService";

const instance = base.service();
const cntl = "/Incident";

export const getIncidents = async () => {
  const response = await instance.get(`${cntl}/getApproved`);
  return response;
};

export const getIncidentsByLocationName = async (name) => {
  const response = await instance.get(`${cntl}/GetAllByLocationName/${name}`);
  return response;
};

export const getIncidentsByCategoryName = async (name) => {
  const response = await instance.get(`${cntl}/GetByCategoryName/${name}`);
  return response;
};

export const getIncidentsOnDate = async (date) => {
  const response = await instance.get(`${cntl}/GetAllOnDate`, {
    date,
  });
  return response;
};

export const getIncidentsInDateRange = async (startDate, endDate) => {
  const response = await instance.get(`${cntl}/GetAllOnDate`, {
    startDate,
    endDate,
  });
  return response;
};

export const createIncident = async (incident) => {
  const response = await instance.post(`${cntl}`, incident);

  return response;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getIncidents,
  getIncidentsByLocationName,
  getIncidentsByCategoryName,
  getIncidentsOnDate,
  getIncidentsInDateRange,
  createIncident,
};
