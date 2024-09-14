import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Box, CircularProgress } from "@mui/material";
import { useSearch } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const initialCenter = {
  lat: 44.787197,
  lng: 20.457273,
};

const geocodeLatLng = async (lat, lng) => {
  const geocoder = new window.google.maps.Geocoder();
  const latLng = new window.google.maps.LatLng(lat, lng);

  try {
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });

    if (results && results.length > 0) {
      return results[0].formatted_address;
    } else {
      return "No address found";
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Geocoding error";
  }
};

const geocodeAddress = async (address) => {
  const geocoder = new window.google.maps.Geocoder();

  try {
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { lat: lat(), lng: lng() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const MapComponent = () => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (searchTerm) {
      const geocodeAndPlaceMarker = async () => {
        const location = await geocodeAddress(searchTerm);
        if (location) {
          setMarkerPosition(location);
        }
      };
      geocodeAndPlaceMarker();
    }
  }, [searchTerm]);

  // Display loading spinner while Google Maps is not loaded
  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Set full screen height
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const extractLocationName = (locationName) => {
    const parts = locationName.split(" ");
    if (parts.length > 1) {
      const locationWithoutComma = parts[1].replace(",", ""); // Uklanjanje zareza
      return locationWithoutComma || parts[2].replace(",", "");
    }
    return locationName.replace(",", ""); // Ukloni zarez ako postoji u jednoj reči
  };

  const handleMarkerDblClick = () => {
    if (markerPosition) {
      let locationName = searchTerm || "unknown-location";
      locationName = extractLocationName(locationName);
      navigate(`/location/${locationName}`);
    }
  };

  const handleMapClick = async (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setMarkerPosition({
      lat: clickedLat,
      lng: clickedLng,
    });
    const locationName = await geocodeLatLng(clickedLat, clickedLng);

    console.log("Kliknuta lokacija:", {
      lat: clickedLat,
      lng: clickedLng,
      name: locationName,
    });

    setSearchTerm(locationName);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box sx={{ flex: 1 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition || initialCenter}
          zoom={10}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            zoomControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <Marker position={markerPosition} onDblClick={handleMarkerDblClick} />
          )}
        </GoogleMap>
      </Box>
    </Box>
  );
};

export default MapComponent;
