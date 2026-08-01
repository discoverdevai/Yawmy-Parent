// Foreground geofence check for parent check-in. Given the nursery's geofence
// centre + radius (from GET /api/parent/nursery), it requests location
// permission, reads the current position once, and reports whether the device
// is inside the radius. The device gate is UX only — the backend re-validates
// lat/lng on check-in and is authoritative.
//
// status: 'checking' | 'inside' | 'outside' | 'denied' | 'unavailable'
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

function haversineMeters(a, b) {
  const R = 6371000; // metres
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useGeofence({ lat, lng, radiusM } = {}) {
  const [state, setState] = useState({ status: 'checking', coords: null, distanceM: null });

  const ready = typeof lat === 'number' && typeof lng === 'number';

  const check = useCallback(async () => {
    if (!ready) return;
    setState((s) => ({ ...s, status: 'checking' }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ status: 'denied', coords: null, distanceM: null });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyM: pos.coords.accuracy ?? undefined,
      };
      const distanceM = haversineMeters(coords, { lat, lng });
      setState({
        status: distanceM <= (radiusM ?? 100) ? 'inside' : 'outside',
        coords,
        distanceM,
      });
    } catch {
      setState({ status: 'unavailable', coords: null, distanceM: null });
    }
  }, [ready, lat, lng, radiusM]);

  useEffect(() => {
    if (ready) check().catch(() => {});
  }, [ready, check]);

  return { ...state, refresh: check };
}
