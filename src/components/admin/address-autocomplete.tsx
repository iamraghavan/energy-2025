'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

interface AddressAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  googleMapsApiKey: string;
}

export function AddressAutocomplete({
  value,
  onValueChange,
  onPlaceSelected,
  googleMapsApiKey,
}: AddressAutocompleteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);

  React.useEffect(() => {
    // If the API key is missing, don't attempt to load the script.
    if (!googleMapsApiKey) {
      console.error("Google Maps API key is missing.");
      setScriptError(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId) || window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
        console.error("Failed to load Google Maps script. Please check your API key and network connection.");
        setScriptError(true);
    }
    document.head.appendChild(script);

  }, [googleMapsApiKey]);

  React.useEffect(() => {
    if (isScriptLoaded && !scriptError && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'in' }, // Example: restrict to India
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onValueChange(place.formatted_address);
        }
        onPlaceSelected(place);
      });
    }
  }, [isScriptLoaded, scriptError, onValueChange, onPlaceSelected]);

  // If the script fails to load or there's an error, fall back to a regular input
  if (scriptError) {
    return (
        <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Enter address manually"
        />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder="Start typing an address for autocomplete..."
    />
  );
}
