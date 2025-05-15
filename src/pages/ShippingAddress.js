import React, { useState, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 24.7136, // Latitude for Riyadh
  lng: 46.6753, // Longitude for Riyadh
};

const gccCountries = [
  "+973", // Bahrain
  "+965", // Kuwait
  "+968", // Oman
  "+974", // Qatar
  "+966", // Saudi Arabia
  "+971", // UAE
];

const ShippingAddress = ({ onAddressConfirm }) => {
  const [selectedLocation, setSelectedLocation] = useState(center);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [addressForm, setAddressForm] = useState({
    phoneCode: "+966", // Default to Saudi Arabia
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const parseAddressComponents = (components) => {
    const addressDetails = {
      city: "",
      state: "",
      postalCode: "",
    };

    components.forEach((component) => {
      if (component.types.includes("locality")) {
        addressDetails.city = component.long_name;
      }
      if (component.types.includes("administrative_area_level_1")) {
        addressDetails.state = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        addressDetails.postalCode = component.long_name;
      }
    });

    return addressDetails;
  };

  const handleMapClick = useCallback(async (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setSelectedLocation({ lat, lng });

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results.length > 0) {
        setFormattedAddress(response.results[0].formatted_address);

        // Extract city, state, and postal code
        const addressComponents = parseAddressComponents(
          response.results[0].address_components
        );

        setAddressForm((prevForm) => ({
          ...prevForm,
          address: response.results[0].formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          postalCode: addressComponents.postalCode,
        }));
      } else {
        setFormattedAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setFormattedAddress("Unable to fetch address");
    }
  }, []);

  const handleLocateMe = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLocation({ lat, lng });

          try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            if (response.results.length > 0) {
              setFormattedAddress(response.results[0].formatted_address);

              // Extract city, state, and postal code
              const addressComponents = parseAddressComponents(
                response.results[0].address_components
              );

              setAddressForm((prevForm) => ({
                ...prevForm,
                address: response.results[0].formatted_address,
                city: addressComponents.city,
                state: addressComponents.state,
                postalCode: addressComponents.postalCode,
              }));
            } else {
              setFormattedAddress("Address not found");
            }
          } catch (error) {
            console.error("Error fetching address:", error);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          setFormattedAddress("Unable to fetch location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirmLocation = () => {
    setIsLocationConfirmed(true);
    if (onAddressConfirm) onAddressConfirm(addressForm); // Pass address back to parent
  };

  const handlePhoneCodeChange = (event) => {
    setAddressForm((prevForm) => ({
      ...prevForm,
      phoneCode: event.target.value,
    }));
  };

  const handlePhoneNumberChange = (event) => {
    setAddressForm((prevForm) => ({
      ...prevForm,
      phoneNumber: event.target.value,
    }));
  };

  return (
    <div className='mb-4'>
      <h4>Shipping Address</h4>
      {!isLocationConfirmed ? (
        <>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedLocation}
            zoom={12}
            onClick={handleMapClick}
          >
            <Marker position={selectedLocation} />
          </GoogleMap>
          <div className='mt-3'>
            <button className='btn btn-primary me-3' onClick={handleLocateMe}>
              Locate Me
            </button>
            <button className='btn btn-success' onClick={handleConfirmLocation}>
              Confirm Location
            </button>
            <div className='mt-2'>
              <strong>Selected Address:</strong>{" "}
              {formattedAddress || "Not selected yet"}
            </div>
          </div>
        </>
      ) : (
        <form>
          <div className='row'>
            {/* Phone Number */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Phone Number</label>
              <div className='input-group'>
                <select
                  className='form-select'
                  value={addressForm.phoneCode}
                  onChange={handlePhoneCodeChange}
                  style={{ width: "30px" }} // Reduced the country code dropdown width
                >
                  {gccCountries.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Phone number'
                  value={addressForm.phoneNumber}
                  onChange={handlePhoneNumberChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className='col-md-12 mb-3'>
              <label className='form-label'>Address</label>
              <input
                type='text'
                className='form-control'
                value={addressForm.address}
                readOnly
              />
            </div>

            {/* City */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>City</label>
              <input
                type='text'
                className='form-control'
                value={addressForm.city}
                readOnly
              />
            </div>

            {/* State */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>State</label>
              <input
                type='text'
                className='form-control'
                value={addressForm.state}
                readOnly
              />
            </div>

            {/* Postal Code */}
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Postal Code</label>
              <input
                type='text'
                className='form-control'
                value={addressForm.postalCode}
                readOnly
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShippingAddress;
