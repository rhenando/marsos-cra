import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import toast from "react-hot-toast";
import Notification from "../global/Notification";
import Select from "react-select";

const gccCountries = [
  { value: "+966", label: "+966" }, // Saudi Arabia
  { value: "+971", label: "+971" }, // United Arab Emirates
  { value: "+973", label: "+973" }, // Bahrain
  { value: "+965", label: "+965" }, // Kuwait
  { value: "+968", label: "+968" }, // Oman
  { value: "+974", label: "+974" }, // Qatar
];

const libraries = ["places"]; // ✅ Load Places API

const DeliveryAddress = () => {
  const { currentUser } = useAuth();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD92sPOOqCshhZW-rQdS71XohnOMRqOsG8", // ✅ Use API Key
    libraries,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Address Fields (Matching Noon’s Input Fields)
  const [buildingNumber, setBuildingNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [additionalDirections, setAdditionalDirections] = useState("");
  const [addressLabel, setAddressLabel] = useState("home"); // Default to "Home"
  const [isDefaultAddress, setIsDefaultAddress] = useState(true); // Default Address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [countryCode, setCountryCode] = useState(gccCountries[0]); // Stores saved addresses
  const [phoneNumber, setPhoneNumber] = useState(""); // ✅ Add this
  // ❌ State for Validation Errors
  const [buildingNumberError, setBuildingNumberError] = useState("");
  const [streetNameError, setStreetNameError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [cityError, setCityError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedUserAddress, setSelectedUserAddress] = useState(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    if (phoneNumber || countryCode?.value) {
      const full = `${countryCode?.value || ""}${phoneNumber || ""}`;
      console.log("Full Phone Number:", full);
    }
  }, [phoneNumber, countryCode]);

  const showNotification = (title, message) => {
    setNotificationContent({ title, message });
    setIsNotificationOpen(true);

    // Automatically close the notification after 3 seconds
    setTimeout(() => {
      setIsNotificationOpen(false);
    }, 3000);
  };

  const defaultCenter = { lat: 24.7136, lng: 46.6753 }; // Riyadh Default Center
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    marginTop: "10px",
    position: "relative", // ✅ Ensure "Locate Me" button is correctly positioned
  };

  // ✅ Fetch Address from Coordinates
  const fetchAddress = useCallback(async (lat, lng) => {
    const apiKey = "AIzaSyD92sPOOqCshhZW-rQdS71XohnOMRqOsG8"; // ✅ Use API Key

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];

        let street = "",
          city = "",
          district = "",
          postalCode = "";

        result.address_components.forEach((component) => {
          if (component.types.includes("route")) {
            street = component.long_name;
          } else if (component.types.includes("locality")) {
            city = component.long_name;
          } else if (component.types.includes("administrative_area_level_1")) {
            district = component.long_name;
          } else if (component.types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });

        // ✅ Update Address Fields
        setStreetName(street);
        setCity(city);
        setDistrict(district);
        setPostalCode(postalCode);
      } else {
        toast.error("Unable to fetch address. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Network issue. Try again.");
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchAddress(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation, fetchAddress]);

  useEffect(() => {
    if (currentUser) {
      fetchUserAddresses(currentUser.uid);
    }
  }, [currentUser]);

  // ✅ Handle Map Click to Select Location
  const handleMapClick = async (event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(newLocation);
    await fetchAddress(newLocation.lat, newLocation.lng);
  };

  // ✅ Handle Address Search Selection
  const handlePlaceSelect = async () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      toast.error("Invalid place selected.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setSelectedLocation({ lat, lng });
    await fetchAddress(lat, lng);
  };

  // ✅ Save Address to Firestore
  const handleSaveAddress = async () => {
    setBuildingNumberError("");
    setStreetNameError("");
    setDistrictError("");
    setCityError("");
    setPostalCodeError("");
    setPhoneNumberError("");

    let isValid = true;

    if (!buildingNumber) {
      setBuildingNumberError("Building number is required.");
      isValid = false;
    }
    if (!streetName) {
      setStreetNameError("Street name is required.");
      isValid = false;
    }
    if (!district) {
      setDistrictError("District is required.");
      isValid = false;
    }
    if (!city) {
      setCityError("City is required.");
      isValid = false;
    }
    if (!postalCode) {
      setPostalCodeError("Postal code is required.");
      isValid = false;
    }
    if (!phoneNumber) {
      setPhoneNumberError("Phone number is required.");
      isValid = false;
    }

    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to save an address.");
      return;
    }

    setIsSaving(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      let existingAddresses = [];

      if (userSnap.exists()) {
        existingAddresses = userSnap.data().addresses || [];
      }

      const fullPhoneNumber = `${countryCode.value}${phoneNumber.trim()}`; // ✅ Combine country code and number

      const newAddress = {
        phoneNumber: fullPhoneNumber, // ✅ Store full phone number
        buildingNumber,
        streetName,
        district,
        city,
        postalCode,
        additionalDirections,
        location: selectedLocation,
        label: addressLabel, // Home or Work
        isDefault: isDefaultAddress, // Set as Default if selected
      };

      if (isDefaultAddress) {
        // Mark all other addresses as non-default
        existingAddresses = existingAddresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }

      if (editingIndex !== null) {
        // ✅ If editing, replace the specific address
        existingAddresses[editingIndex] = newAddress;

        // ✅ Update Firestore with the modified array
        await updateDoc(userRef, { addresses: existingAddresses });
      } else {
        // ✅ If adding new, use arrayUnion()
        await updateDoc(userRef, {
          addresses: arrayUnion(newAddress),
        });
      }

      toast.success(
        editingIndex !== null
          ? "Address updated successfully!"
          : "Address saved successfully!"
      );
      showNotification(
        editingIndex !== null ? "Address Updated" : "Address Saved",
        "Your address has been successfully saved!"
      );

      // ✅ Reset all form fields after saving
      setBuildingNumber("");
      setStreetName("");
      setDistrict("");
      setCity("");
      setPostalCode("");
      setAdditionalDirections("");
      setAddressLabel("home"); // Reset label to home
      setIsDefaultAddress(true); // Reset default status
      setPhoneNumber("");
      setCountryCode(gccCountries[0]); // Reset country code to default
      setSelectedLocation(null); // Reset selected location
      setEditingIndex(null); // Reset editing state
      setShowAddressForm(false); // Close form

      fetchUserAddresses(currentUser.uid); // Refresh addresses

      // ✅ Scroll to the top after saving
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Smooth scrolling effect
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    }

    setIsSaving(false);
  };

  const fetchUserAddresses = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setSavedAddresses(userSnap.data().addresses || []);
    } else {
      setSavedAddresses([]);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          await fetchAddress(latitude, longitude);
          toast.success("Location detected successfully!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to detect location. Please enable GPS.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleEditAddress = (index) => {
    const address = savedAddresses[index];

    setPhoneNumber(address.phoneNumber || "");
    setBuildingNumber(address.buildingNumber);
    setStreetName(address.streetName);
    setDistrict(address.district);
    setCity(address.city);
    setPostalCode(address.postalCode);
    setAdditionalDirections(address.additionalDirections || "");
    setAddressLabel(address.label);
    setIsDefaultAddress(address.isDefault);

    setSelectedLocation(address.location);
    setEditingIndex(index); // Store the index for updating
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (index) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const updatedAddresses = savedAddresses.filter((_, i) => i !== index);

      await updateDoc(userRef, { addresses: updatedAddresses });
      setSavedAddresses(updatedAddresses); // Update UI
      toast.success("Address deleted successfully!");
      showNotification(
        "Address Deleted",
        "Your address has been successfully removed."
      );
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address.");
    }
  };

  if (loadError) return <p>Failed to load Google Maps. Please try again.</p>;
  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <div className='card mb-4' style={{ fontSize: "14px" }}>
      <div className='card-body'>
        {showAddressForm ? (
          <div className='p-3 border rounded'>
            <h6
              className='mb-3'
              style={{ fontSize: "14px", fontWeight: "600" }}
            >
              Enter Your Address
            </h6>
            {/* 🔍 Autocomplete Search */}
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={handlePlaceSelect}
            >
              <input
                type='text'
                className='form-control mb-3'
                placeholder='Search your address...'
                style={{ fontSize: "13px" }}
              />
            </Autocomplete>
            {/* 🗺️ Map Selection */}
            <div className='d-flex justify-content-start'>
              <button
                className='btn btn-sm'
                onClick={() => setShowMap(!showMap)}
                style={{
                  border: "2px solid #2c6449",
                  backgroundColor: "transparent",
                  color: "#2c6449",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#2c6449";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#2c6449";
                }}
              >
                {showMap ? "Hide Map" : "Select on Map"}
              </button>
            </div>
            {showMap && (
              <div style={mapContainerStyle}>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }} // ✅ Keep original styles
                  center={selectedLocation || defaultCenter}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {selectedLocation && <MarkerF position={selectedLocation} />}
                </GoogleMap>

                {/* 📍 Locate Me Button Positioned Inside the Map (Bottom Left) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "10px",
                    zIndex: 1000,
                    backgroundColor: "#fff",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={handleLocateMe}
                >
                  📍 Locate Me
                </div>
              </div>
            )}
            {/* 📌 Address Fields */}
            {/* 📌 Phone Number Section */}
            <div className='d-flex align-items-center mb-2 mt-2'>
              {/* 📌 Country Code Dropdown */}
              <div
                style={{ width: "100px", marginRight: "8px", fontSize: "13px" }}
              >
                <Select
                  options={gccCountries}
                  value={countryCode}
                  onChange={setCountryCode}
                  isSearchable={false} // Disable search for better UX
                />
              </div>

              {/* 📌 Phone Number Input (Restricted to 9 Digits, No Leading 0) */}
              <input
                type='text'
                className='form-control'
                style={{ width: "180px", fontSize: "13px" }}
                placeholder='Phone Number'
                value={phoneNumber}
                onChange={(e) => {
                  let value = e.target.value;

                  // ✅ Remove non-numeric characters
                  value = value.replace(/\D/g, "");

                  // ✅ Check for invalid starting digit
                  if (value.startsWith("0")) {
                    setPhoneNumberError("Phone number cannot start with 0.");
                  } else if (value.length > 9) {
                    setPhoneNumberError(
                      "Phone number must be a maximum of 9 digits."
                    );
                  } else {
                    setPhoneNumberError(""); // ✅ Clear error if valid
                  }

                  // ✅ Limit to 9 digits max and prevent leading 0
                  if (!value.startsWith("0") && value.length <= 9) {
                    setPhoneNumber(value);
                  }
                }}
              />
            </div>
            {/* 📌 Show Warning Message if Validation Fails */}
            {phoneNumberError && (
              <p className='text-danger small mt-1'>{phoneNumberError}</p>
            )}
            {/* 📌 Address Fields - Row 1 (Building Number & Street Name) */}
            <div className='row'>
              <div className='col-md-6'>
                <input
                  type='text'
                  className='form-control mb-2'
                  placeholder='Building Number'
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  style={{ width: "150px", fontSize: "13px" }}
                />
                {buildingNumberError && (
                  <p className='text-danger small'>{buildingNumberError}</p>
                )}
              </div>
              <div className='col-md-6'>
                <input
                  type='text'
                  className='form-control mb-2'
                  placeholder='Street Name'
                  value={streetName}
                  style={{ width: "150px", fontSize: "13px" }}
                  readOnly
                />
                {streetNameError && (
                  <p className='text-danger small'>{streetNameError}</p>
                )}
              </div>
            </div>
            {/* 📌 Address Fields - Row 2 (District, City, Postal Code) */}
            <div className='row'>
              <div className='col-md-4'>
                <input
                  type='text'
                  style={{ width: "100px", fontSize: "13px" }}
                  className='form-control mb-2'
                  placeholder='District'
                  value={district}
                  readOnly
                />
                {districtError && (
                  <p className='text-danger small'>{districtError}</p>
                )}
              </div>
              <div className='col-md-4'>
                <input
                  type='text'
                  style={{ width: "100px", fontSize: "13px" }}
                  className='form-control mb-2'
                  placeholder='City'
                  value={city}
                  readOnly
                />
                {cityError && <p className='text-danger small'>{cityError}</p>}
              </div>
              <div className='col-md-4'>
                <input
                  type='text'
                  style={{ width: "100px", fontSize: "13px" }}
                  className='form-control mb-2'
                  placeholder='Postal Code'
                  value={postalCode}
                  readOnly
                />
                {postalCodeError && (
                  <p className='text-danger small'>{postalCodeError}</p>
                )}
              </div>
            </div>
            {/* ✅ Address Label */}
            <label
              className='mb-2'
              style={{ fontSize: "13px", fontWeight: "500" }}
            >
              Label Address:
            </label>
            <div className='mb-2'>
              <div className='form-check form-check-inline'>
                <input
                  className='form-check-input'
                  type='radio'
                  id='home'
                  name='addressLabel'
                  value='home'
                  checked={addressLabel === "home"}
                  onChange={(e) => setAddressLabel(e.target.value)}
                />
                <label
                  className='form-check-label'
                  htmlFor='home'
                  style={{ fontSize: "13px" }}
                >
                  Home
                </label>
              </div>
              <div className='form-check form-check-inline'>
                <input
                  className='form-check-input'
                  type='radio'
                  id='work'
                  name='addressLabel'
                  value='work'
                  checked={addressLabel === "work"}
                  onChange={(e) => setAddressLabel(e.target.value)}
                />
                <label
                  className='form-check-label'
                  htmlFor='work'
                  style={{ fontSize: "13px" }}
                >
                  Work
                </label>
              </div>
            </div>
            <input
              type='checkbox'
              checked={isDefaultAddress}
              onChange={() => setIsDefaultAddress(!isDefaultAddress)}
            />
            <label
              className='form-check-label'
              htmlFor='home'
              style={{ fontSize: "13px" }}
            >
              Set as Default Address
            </label>

            {/* ✅ Save Address Button */}
            <div className='d-flex justify-content-start mt-3'>
              <button
                className='btn btn-sm me-2'
                onClick={handleSaveAddress}
                disabled={isSaving}
                style={{
                  border: "2px solid #2c6449",
                  backgroundColor: "transparent",
                  color: "#2c6449",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#2c6449";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#2c6449";
                }}
              >
                {isSaving ? "Saving..." : "Save Address"}
              </button>

              <button
                className='btn btn-sm'
                onClick={() => {
                  // Reset fields and close form
                  setShowAddressForm(false);
                  setEditingIndex(null);
                  setPhoneNumber("");
                  setBuildingNumber("");
                  setStreetName("");
                  setDistrict("");
                  setCity("");
                  setPostalCode("");
                  setAdditionalDirections("");
                  setAddressLabel("home");
                  setIsDefaultAddress(true);
                  setSelectedLocation(null);
                }}
                style={{
                  border: "2px solid #ccc",
                  backgroundColor: "transparent",
                  color: "#555",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#ccc";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#555";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {savedAddresses.length > 0 && (
              <div className='mb-4'>
                <h5 className='mb-3'>Saved Addresses</h5>
                {savedAddresses.map((address, index) => (
                  <div key={index} className='border p-3 mb-3 rounded'>
                    <p className='mb-1'>
                      <strong>{address.label.toUpperCase()}</strong>{" "}
                      {address.isDefault && (
                        <span className='text-success'>(Default)</span>
                      )}
                    </p>
                    {address.phoneNumber && (
                      <p className='mb-1'>{address.phoneNumber}</p>
                    )}

                    <p className='mb-1'>
                      {address.buildingNumber}, {address.streetName}
                    </p>
                    <p className='mb-1'>
                      {address.district}, {address.city}, {address.postalCode}
                    </p>
                    {address.additionalDirections && (
                      <p className='mb-1'>
                        <i>{address.additionalDirections}</i>
                      </p>
                    )}
                    <div className='d-flex justify-content-between align-items-center mt-2'>
                      <div>
                        <button
                          className='btn btn-outline-primary btn-sm'
                          onClick={() => handleEditAddress(index)}
                          style={{ fontSize: "12px" }} // 👈 Reduced font size
                        >
                          Edit
                        </button>
                        <button
                          className='btn btn-outline-danger btn-sm ms-2'
                          onClick={() => handleDeleteAddress(index)}
                          style={{ fontSize: "12px" }} // 👈 Reduced font size
                        >
                          Delete
                        </button>
                      </div>
                      <button
                        className={`btn btn-sm ms-2 ${
                          selectedUserAddress?.buildingNumber ===
                            address.buildingNumber &&
                          selectedUserAddress?.postalCode === address.postalCode
                            ? "btn-success"
                            : "btn-outline-success"
                        }`}
                        onClick={() => setSelectedUserAddress(address)}
                        style={{ fontSize: "12px" }} // 👈 Reduced font size
                      >
                        {selectedUserAddress?.buildingNumber ===
                          address.buildingNumber &&
                        selectedUserAddress?.postalCode === address.postalCode
                          ? "Selected"
                          : "Select"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className='d-flex justify-content-start'>
              <button
                className='btn btn-sm'
                onClick={() => setShowAddressForm(true)}
                style={{
                  border: "2px solid #2c6449",
                  backgroundColor: "transparent",
                  color: "#2c6449",
                  fontWeight: "bold",

                  width: "150px", // Medium width
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#2c6449";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#2c6449";
                }}
              >
                Add New Address
              </button>
            </div>
          </>
        )}
      </div>
      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)} // Close handler
        title={notificationContent.title}
        message={notificationContent.message}
        duration={3000} // Auto-close after 5 seconds
      />
    </div>
  );
};

export default DeliveryAddress;
