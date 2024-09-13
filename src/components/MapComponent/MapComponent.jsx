import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Box, CircularProgress } from "@mui/material";
import { useSearch } from "../../context/SearchContext";

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
      // Return the formatted address of the first result
      return results[0].formatted_address;
    } else {
      return "No address found";
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Geocoding error";
  }
};

const MapComponent = () => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const { searchTerm } = useSearch();
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  useEffect(() => {
    console.log(searchTerm);
    if (!searchTerm) {
      map && map.panTo(initialCenter);
    }
  }, [searchTerm, map]);

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

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
          onLoad={(map) => setMap(map)}
        >
          {markerPosition && (
            <Marker position={markerPosition} />
          )}
        </GoogleMap>
      </Box>
    </Box>
  );
};

export default MapComponent;
