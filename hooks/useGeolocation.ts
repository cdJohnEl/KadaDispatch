'use client';

import { useState, useEffect } from 'react';

interface GeolocationPosition {
    lat: number;
    lng: number;
}

interface UseGeolocationOptions {
    enabled: boolean;
    onLocationUpdate?: (position: GeolocationPosition) => void;
    updateInterval?: number; // in milliseconds
}

/**
 * Hook to track user's geolocation in real-time
 * Only tracks when enabled (e.g., during active deliveries)
 */
export function useGeolocation({
    enabled,
    onLocationUpdate,
    updateInterval = 30000 // Default: update every 30 seconds
}: UseGeolocationOptions) {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setLocation(null);
            setError(null);
            return;
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(newLocation);
                setLoading(false);
                setError(null);

                if (onLocationUpdate) {
                    onLocationUpdate(newLocation);
                }
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Watch position for continuous updates
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(newLocation);
                setError(null);

                if (onLocationUpdate) {
                    onLocationUpdate(newLocation);
                }
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: updateInterval
            }
        );

        // Cleanup
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [enabled, onLocationUpdate, updateInterval]);

    return {
        location,
        error,
        loading
    };
}
