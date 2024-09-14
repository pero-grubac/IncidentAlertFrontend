import axios from "axios";
import enviroments from "../enviroments";

// Konfigurišemo osnovni URL
const baseUrlConfig = {
  baseUrl: enviroments().baseServiceUrl,
};

// Kreiramo instancu axios-a
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: baseUrlConfig.baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interseptor za hvatanje grešaka (opcionalno)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 500) {
        console.error("Server error occurred");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Eksportujemo instancu axios-a
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  service: () => createAxiosInstance(),
};
