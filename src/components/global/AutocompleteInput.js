import React, { useState, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

const AutocompleteInput = ({ value, placeholder, onPlaceSelected }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      let address = place.formatted_address;
      let city = "";
      let region = "";

      place.address_components.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          region = component.long_name;
        }
      });

      onPlaceSelected({ address, city, region });
    }
  };

  return (
    <Autocomplete
      onLoad={(auto) => setAutocomplete(auto)}
      onPlaceChanged={handlePlaceChanged}
    >
      <input
        ref={inputRef}
        type='text'
        placeholder={placeholder}
        className='form-control'
        defaultValue={value}
      />
    </Autocomplete>
  );
};

export default AutocompleteInput;
