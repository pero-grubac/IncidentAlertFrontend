// components/LocationPage/LocationPage.js
import React from "react";
import { useParams } from "react-router-dom";

const LocationPage = () => {
  const { locationName } = useParams(); // Extract location name from the URL

  return (
    <div>
      <h1>Location: {locationName}</h1>
      {/* Dodaj dodatne informacije o lokaciji */}
      <p>Here are some details about {locationName}...</p>
    </div>
  );
};

export default LocationPage;
