import { useEffect, useRef, useState } from "react";
import client from "../api/client.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { searchAddress } from "../utils/geocode.js";
import { haversineKm } from "../utils/distance.js";
import DonationCard from "../components/DonationCard.jsx";
import { DonationGridSkeleton } from "../components/DonationCardSkeleton.jsx";
import Button from "../components/Button.jsx";
import locationImg from "../assets/illustrations/location.png";

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
    <div className="texture-grain min-h-[calc(100vh-73px)] bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Browse donations</h1>
              <p className="mt-1 text-charcoal-700">Available surplus food near you, closest first.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-charcoal-800">
                Radius
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-3 py-2 text-sm font-medium text-charcoal-900 outline-none focus:border-terracotta-500"
                >
                  {[5, 10, 25, 50].map((km) => (
                    <option key={km} value={km}>{km} km</option>
                  ))}
                </select>
              </label>
              <Button variant="outline" onClick={requestLocation} disabled={geoLoading}>
                {geoLoading ? "Locating…" : coords ? "Refresh location" : "📍 Use my location"}
              </Button>
            </div>
          </div>

          {geoError && (
            <p className="mt-5 rounded-xl bg-danger-500/10 px-4 py-2.5 text-sm text-danger-500">{geoError}</p>
          )}
          {message && (
            <p className="mt-5 rounded-xl bg-olive-100 px-4 py-2.5 text-sm text-olive-700">{message}</p>
          )}

          {!coords && (
            <div className="relative mt-6 max-w-sm">
              <p className="mb-2 text-sm font-medium text-charcoal-700">Or type a location to browse from instead:</p>
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
        </div>

        {!coords ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-charcoal-900/20 bg-cream-50 px-6 py-14 text-center">
            <img src={locationImg} alt="" className="h-40 w-40 object-contain sm:h-48 sm:w-48" />
            <h2 className="mt-2 font-display text-xl font-semibold text-charcoal-900">Find food near you</h2>
            <p className="mt-2 max-w-sm text-charcoal-700">
              Share your location, or search above, to see available donations closest to you first.
            </p>
            <Button variant="primary" className="mt-6" onClick={requestLocation} disabled={geoLoading}>
              {geoLoading ? "Locating…" : "📍 Use my location"}
            </Button>
          </div>
        ) : loading ? (
          <div className="mt-8">
            <DonationGridSkeleton />
          </div>
        ) : donations.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-charcoal-900/20 bg-cream-50 px-6 py-14 text-center">
            <p className="text-4xl">🔍</p>
            <h2 className="mt-3 font-display text-xl font-semibold text-charcoal-900">Nothing nearby just yet</h2>
            <p className="mt-2 text-charcoal-700">No available donations within {radiusKm} km — try widening the radius.</p>
          </div>
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
    </div>
  );
}
