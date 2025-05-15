// src/components/global/MapView.js

import React from "react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import LoadingSpinner from "./LoadingSpinner";

const GOOGLE_MAPS_API_KEY = "AIzaSyD92sPOOqCshhZW-rQdS71XohnOMRqOsG8";
const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "400px", // You can make this responsive if needed
};

const center = {
  lat: 24.7136,
  lng: 46.6753,
};

const MapView = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) {
    return (
      <div className='flex flex-col items-center justify-center h-96 text-red-600'>
        <p>Failed to load Google Maps. Please try again later.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className='flex flex-col items-center justify-center h-96 bg-gray-100'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-600'>Loading map...</p>
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {/* Optional: Add markers or directions here */}
    </GoogleMap>
  );
};

export default MapView;
