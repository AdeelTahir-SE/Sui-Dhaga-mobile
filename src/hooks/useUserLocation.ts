import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export const DEFAULT_COORDS: UserCoordinates = {
  lat: 31.5204, // Lahore default reference
  lng: 74.3587,
};

export function useUserLocation(autoFetch: boolean = true) {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const requestLocation = useCallback(async (): Promise<UserCoordinates> => {
    setIsLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise<UserCoordinates>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const location: UserCoordinates = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              setCoords(location);
              setPermissionGranted(true);
              setIsLoading(false);
              resolve(location);
            },
            (err) => {
              console.warn('Web geolocation error:', err.message);
              setError(err.message);
              setPermissionGranted(false);
              setCoords(DEFAULT_COORDS);
              setIsLoading(false);
              resolve(DEFAULT_COORDS);
            },
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionGranted(false);
        setError('Location permission denied. Using standard reference.');
        setCoords(DEFAULT_COORDS);
        setIsLoading(false);
        return DEFAULT_COORDS;
      }

      setPermissionGranted(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const location: UserCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCoords(location);
      setIsLoading(false);
      return location;
    } catch (err: any) {
      console.warn('Error fetching device location:', err?.message);
      setError(err?.message || 'Could not fetch device coordinates');
      setCoords(DEFAULT_COORDS);
      setIsLoading(false);
      return DEFAULT_COORDS;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      requestLocation();
    }
  }, [autoFetch, requestLocation]);

  return {
    coords: coords || DEFAULT_COORDS,
    rawCoords: coords,
    isLoading,
    error,
    permissionGranted,
    requestLocation,
  };
}
