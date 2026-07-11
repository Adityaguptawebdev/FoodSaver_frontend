import { useState } from "react";

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError("");
        setLoading(false);
      },
      () => {
        setError("Couldn't get your location. You can still enter the address manually.");
        setLoading(false);
      }
    );
  }

  return { coords, error, loading, requestLocation };
}
