// Build-time configuration (see .env.example).
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
};

export const translationEnabled = Boolean(config.googleApiKey);
