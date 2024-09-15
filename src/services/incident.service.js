import base from "./baseService";

const instance = base.service();

export const getIncidents = async ()=>{
    const response = await instance.get("/Incidents/getApproved");
    return response;
}

// getByLocationName
// getByCategory



// eslint-disable-next-line import/no-anonymous-default-export
export default{
    getIncidents
}