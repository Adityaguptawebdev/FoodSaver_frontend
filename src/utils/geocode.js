// Nominatim (OpenStreetMap) is free and needs no API key, unlike Google/Mapbox
// geocoding. Its usage policy caps free client-side use at ~1 req/sec, which
// is fine at this app's scale — a higher-traffic deployment would need a
// self-hosted instance or a paid provider instead.
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  return data.display_name || "";
}

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const res = await fetch(
    `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`
  );
  if (!res.ok) throw new Error("Address search failed");
  const data = await res.json();
  return data.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
}
