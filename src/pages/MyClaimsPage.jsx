import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import DonationCard from "../components/DonationCard.jsx";
import { DonationGridSkeleton } from "../components/DonationCardSkeleton.jsx";
import Button from "../components/Button.jsx";
import foodCarryImg from "../assets/illustrations/food-carry.png";

function ClaimActions({ claim, onUpdate }) {
  const [code, setCode] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(status, extra = {}, photoFile = null) {
    setBusy(true);
    setError("");
    try {
      if (photoFile) {
        const data = new FormData();
        data.append("status", status);
        Object.entries(extra).forEach(([k, v]) => data.append(k, v));
        data.append("photo", photoFile);
        await client.patch(`/claims/${claim._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await client.patch(`/claims/${claim._id}`, { status, ...extra });
      }
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update this claim.");
    } finally {
      setBusy(false);
    }
  }

  if (claim.status === "claimed") {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="primary" className="w-full text-sm" disabled={busy} onClick={() => updateStatus("out_for_pickup")}>
          Mark out for pickup
        </Button>
        <Button variant="ghost" className="w-full text-sm" disabled={busy} onClick={() => updateStatus("cancelled")}>
          Cancel claim
        </Button>
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    );
  }

  if (claim.status === "out_for_pickup") {
    return (
      <div className="flex flex-col gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter handoff code from donor"
          className="rounded-lg border border-charcoal-900/15 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-500"
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-charcoal-700">
          Proof of pickup photo (optional)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="rounded-lg border border-charcoal-900/15 bg-cream-50 px-3 py-1.5 text-xs outline-none file:mr-2 file:rounded-full file:border-0 file:bg-terracotta-500 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-cream-50"
          />
        </label>
        <Button
          variant="primary"
          className="w-full text-sm"
          disabled={busy || code.length === 0}
          onClick={() => updateStatus("picked_up", { handoffCode: code }, photo)}
        >
          Confirm pickup
        </Button>
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    );
  }

  if (claim.status === "picked_up") {
    return (
      <Button variant="secondary" className="w-full text-sm" disabled={busy} onClick={() => updateStatus("delivered")}>
        Mark delivered
      </Button>
    );
  }

  return null;
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client
      .get("/claims/mine")
      .then((res) => setClaims(res.data.claims))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const activeCount = claims.filter((c) => !["delivered", "cancelled", "expired"].includes(c.status)).length;

  return (
    <div className="texture-grain min-h-[calc(100vh-73px)] bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-gradient-to-br from-cream-100 to-cream-200/60 px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-terracotta-500/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-olive-500/10" aria-hidden="true" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-terracotta-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta-700">
                Your claims
              </span>
              <h1 className="mt-3 font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">My claims</h1>
              <p className="mt-2 max-w-md text-sm text-charcoal-700 sm:text-base">
                Track pickups from claim to delivery, and confirm handoffs as they happen.
              </p>
            </div>

            {!loading && claims.length > 0 && (
              <div className="rounded-2xl border border-charcoal-900/10 bg-cream-50 px-6 py-4 text-center shadow-sm">
                <div className="font-display text-3xl font-semibold text-terracotta-600">{activeCount}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-charcoal-700">Active pickups</div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <DonationGridSkeleton />
          </div>
        ) : claims.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-charcoal-900/20 bg-cream-50 px-6 py-14 text-center">
            <img src={foodCarryImg} alt="" className="h-40 w-40 object-contain sm:h-48 sm:w-48" />
            <h2 className="mt-2 font-display text-xl font-semibold text-charcoal-900">No claims yet</h2>
            <p className="mt-2 max-w-sm text-charcoal-700">
              You haven't claimed any donations yet — browse what's available nearby and grab one.
            </p>
            <Button as={Link} to="/browse" variant="primary" className="mt-6">
              Browse donations
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {claims.map((c) => (
              <DonationCard
                key={c._id}
                donation={{ ...c.donation, status: c.status }}
                pickupPhotoUrl={c.pickupPhotoUrl}
                footer={<ClaimActions claim={c} onUpdate={load} />}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
