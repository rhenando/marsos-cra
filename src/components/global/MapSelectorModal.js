import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const MapSelectorModal = ({ isOpen, onClose, onLocationSelect }) => {
  if (!isOpen) return null;

  const mapContainerStyle = {
    width: "100%",
    height: "80%",
  };

  const center = {
    lat: 37.7749, // Example latitude (San Francisco)
    lng: -122.4194, // Example longitude (San Francisco)
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    onLocationSelect(location); // Pass the selected location to the parent
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 2000,
        }}
        onClick={onClose}
      />
      {/* Modal Content */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "60%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          zIndex: 3000,
        }}
      >
        <h3 style={{ padding: "10px" }}>Select Delivery Location</h3>
        <div style={mapContainerStyle}>
          <LoadScript googleMapsApiKey='AIzaSyD92sPOOqCshhZW-rQdS71XohnOMRqOsG8'>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
              onClick={handleMapClick}
            >
              <Marker position={center} />
            </GoogleMap>
          </LoadScript>
        </div>
        <div style={{ padding: "10px", textAlign: "right" }}>
          <button
            onClick={onClose}
            className='btn btn-secondary'
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default MapSelectorModal;
