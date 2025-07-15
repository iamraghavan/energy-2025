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

  React.useEffect(() => {
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
    document.head.appendChild(script);

    return () => {
        // Clean up script
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            // document.head.removeChild(existingScript);
        }
    }
  }, [googleMapsApiKey]);

  React.useEffect(() => {
    if (isScriptLoaded && inputRef.current && window.google) {
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
  }, [isScriptLoaded, onValueChange, onPlaceSelected]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder="Start typing an address..."
    />
  );
}
