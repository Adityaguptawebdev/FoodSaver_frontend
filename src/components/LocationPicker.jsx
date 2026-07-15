import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { reverseGeocode, searchAddress } from "../utils/geocode.js";
import Button from "./Button.jsx";

// Vite doesn't resolve Leaflet's default marker image paths when bundled;
// point at the CDN copies instead (the standard leaflet + bundler workaround).
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = { lat: 20, lng: 0 };

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 13));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);
  return null;
}

export default function LocationPicker({ address, onAddressChange, coords, onCoordsChange, required = false }) {
  const { coords: geoCoords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (geoCoords) onCoordsChange(geoCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoCoords?.lat, geoCoords?.lng]);

  useEffect(() => {
    if (!coords) {
      setResolvedAddress("");
      return;
    }
    let cancelled = false;
    setResolving(true);
    reverseGeocode(coords.lat, coords.lng)
      .then((label) => {
        if (cancelled) return;
        setResolvedAddress(label);
        if (label && !address) onAddressChange(label);
      })
      .catch(() => !cancelled && setResolvedAddress(""))
      .finally(() => !cancelled && setResolving(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  function handleQueryChange(value) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await searchAddress(value));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function pickSuggestion(s) {
    onCoordsChange({ lat: s.lat, lng: s.lng });
    onAddressChange(s.label);
    setQuery("");
    setSuggestions([]);
  }

  const center = coords || DEFAULT_CENTER;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
        Address
        <input
          required={required}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Street, area, city"
          className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
        />
      </label>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search for a place…"
          className="w-full rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-terracotta-500"
        />
        {searching && <p className="mt-1 text-xs text-charcoal-700">Searching…</p>}
        {suggestions.length > 0 && (
          <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-xl border border-charcoal-900/15 bg-cream-50 shadow-md">
            {suggestions.map((s) => (
              <li key={`${s.lat},${s.lng}`}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="block w-full px-4 py-2 text-left text-sm text-charcoal-800 hover:bg-cream-200"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal-900/15" style={{ height: 220 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={coords ? 13 : 2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onCoordsChange} />
          <Recenter coords={coords} />
          {coords && (
            <Marker
              position={[coords.lat, coords.lng]}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onCoordsChange({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-cream-200 px-4 py-3">
        <Button type="button" variant="outline" onClick={requestLocation} disabled={geoLoading} className="py-1.5 text-sm">
          {geoLoading ? "Locating…" : "Use my current location"}
        </Button>
        <span className="text-xs text-charcoal-700">
          {resolving
            ? "Resolving address…"
            : coords
              ? resolvedAddress || "Pinned — drag the marker or search to adjust"
              : "Click the map, search, or use your current location"}
        </span>
      </div>
      {geoError && <p className="text-xs text-danger-500">{geoError}</p>}
    </div>
  );
}
