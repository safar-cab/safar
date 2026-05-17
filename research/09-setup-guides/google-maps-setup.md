# Google Maps Setup Guide

## 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create new project: "CabBookingApp"
3. Enable billing (credit card required — won't charge within free tier)

## 2. Enable APIs

Enable these APIs in Google Cloud Console:
1. **Maps JavaScript API** — Display maps
2. **Directions API** — Route calculation
3. **Distance Matrix API** — Distance between points
4. **Places API** — Address autocomplete
5. **Geocoding API** — Address to coordinates

## 3. Create API Key

1. APIs & Services → Credentials → Create Credentials → API Key
2. Restrict the key:
   - **Application restriction**: HTTP referrers
   - Add: `yourdomain.in/*`, `localhost:3000/*`
   - **API restriction**: Select only the 5 APIs above

## 4. Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_SERVER_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx  # For server-side API calls
```

> Use separate keys for client (restricted to HTTP referrer) and server (restricted to IP).

## 5. Install Package

```bash
npm install @react-google-maps/api
```

## 6. Map Component

```typescript
// components/maps/BookingMap.tsx
'use client';

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

const libraries: ('places')[] = ['places'];

export function BookingMap({ pickup, drop, stops }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const calculateRoute = useCallback(async () => {
    if (!pickup || !drop) return;

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: pickup,
      destination: drop,
      waypoints: stops?.map(s => ({ location: s, stopover: true })) || [],
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirections(result);
  }, [pickup, drop, stops]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      center={{ lat: 22.7196, lng: 75.8577 }} // Indore
      zoom={12}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
```

## 7. Place Autocomplete

```typescript
// components/maps/PlaceAutocomplete.tsx
import { Autocomplete } from '@react-google-maps/api';

export function PlaceAutocomplete({ onSelect }: { onSelect: (place: Place) => void }) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  return (
    <Autocomplete
      onLoad={setAutocomplete}
      onPlaceChanged={() => {
        if (autocomplete) {
          const place = autocomplete.getPlace();
          onSelect({
            address: place.formatted_address!,
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
          });
        }
      }}
      options={{ componentRestrictions: { country: 'in' } }}
    >
      <input type="text" placeholder="Enter location" className="..." />
    </Autocomplete>
  );
}
```

## 8. Server-Side Distance Calculation

```typescript
// lib/maps.ts
export async function calculateDistance(
  origin: string,
  destination: string,
  waypoints?: string[]
) {
  const waypointStr = waypoints?.length
    ? `&waypoints=${waypoints.join('|')}`
    : '';

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointStr}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`
  );
  const data = await res.json();

  const route = data.routes[0];
  const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);
  const totalDuration = route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0);

  return {
    distanceKm: Math.round(totalDistance / 1000),
    durationMinutes: Math.round(totalDuration / 60),
  };
}
```

## 9. India-Specific Pricing
- Billing in INR
- Free monthly thresholds per API
- Monitor usage in Google Cloud Console → APIs & Services → Dashboard
- Set budget alerts at ₹500, ₹1000

## 10. Cost Optimization
- Cache route calculations (same route = same distance)
- Use Leaflet + OpenStreetMap for map display (free)
- Use Google only for Directions + Distance (paid APIs)
- Minimize Places API calls (debounce autocomplete input)
