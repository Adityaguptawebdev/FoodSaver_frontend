import { useEffect, useRef, useState } from "react";
import client from "../api/client.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { searchAddress } from "../utils/geocode.js";
import { haversineKm } from "../utils/distance.js";
import DonationCard from "../components/DonationCard.jsx";
import { DonationGridSkeleton } from "../components/DonationCardSkeleton.jsx";
import Button from "../components/Button.jsx";

export default function BrowsePage() {
  const { coords: geoCoords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [coords, setCoords] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (geoCoords) setCoords(geoCoords);
  }, [geoCoords]);

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
    setCoords({ lat: s.lat, lng: s.lng });
    setQuery(s.label);
    setSuggestions([]);
  }

  function load() {
    if (!coords) return;
    setLoading(true);
    client
      .get("/donations", { params: { lng: coords.lng, lat: coords.lat, radiusKm, status: "available" } })
      .then((res) => setDonations(res.data.donations))
      .finally(() => setLoading(false));
  }

  useEffect(load, [coords, radiusKm]);

  async function handleClaim(id) {
    setClaimingId(id);
    setMessage("");
    try {
      await client.post(`/claims/${id}`);
      setMessage("Claimed! Check 'My claims' to coordinate pickup.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Couldn't claim this donation — it may already be taken.");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Browse donations</h1>
          <p className="mt-1 text-charcoal-700">Available surplus food near you, closest first.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-charcoal-800">
            Radius
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="ml-2 rounded-lg border border-charcoal-900/15 bg-cream-50 px-2 py-1.5"
            >
              {[5, 10, 25, 50].map((km) => (
                <option key={km} value={km}>{km} km</option>
              ))}
            </select>
          </label>
          <Button variant="outline" onClick={requestLocation} disabled={geoLoading}>
            {geoLoading ? "Locating…" : coords ? "Refresh location" : "Use my location"}
          </Button>
        </div>
      </div>

      {geoError && <p className="mt-4 text-sm text-danger-500">{geoError}</p>}
      {message && <p className="mt-4 rounded-lg bg-olive-100 px-4 py-2 text-sm text-olive-700">{message}</p>}

      {!coords && (
        <div className="relative mt-6 max-w-sm">
          <p className="mb-2 text-sm text-charcoal-700">Or type a location to browse from instead:</p>
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search for a place…"
            className="w-full rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-terracotta-500"
          />
          {searching && <p className="mt-1 text-xs text-charcoal-700">Searching…</p>}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-charcoal-900/15 bg-cream-50 shadow-md">
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
      )}

      {!coords ? (
        <p className="mt-10 text-charcoal-700">Share your location, or search above, to see donations near you.</p>
      ) : loading ? (
        <DonationGridSkeleton />
      ) : donations.length === 0 ? (
        <p className="mt-10 text-charcoal-700">No available donations in this radius right now — try widening it.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donations.map((d) => (
            <DonationCard
              key={d._id}
              donation={d}
              distanceKm={
                d.location?.coordinates?.length === 2
                  ? haversineKm(coords.lat, coords.lng, d.location.coordinates[1], d.location.coordinates[0])
                  : null
              }
              footer={
                <Button
                  variant="primary"
                  className="w-full text-sm"
                  disabled={claimingId === d._id}
                  onClick={() => handleClaim(d._id)}
                >
                  {claimingId === d._id ? "Claiming…" : "Claim this donation"}
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
