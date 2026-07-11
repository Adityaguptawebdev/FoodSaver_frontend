import { useEffect, useState } from "react";
import client from "../api/client.js";
import DonationCard from "../components/DonationCard.jsx";
import Button from "../components/Button.jsx";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">My claims</h1>

      {loading ? (
        <p className="mt-8 text-charcoal-700">Loading…</p>
      ) : claims.length === 0 ? (
        <p className="mt-8 text-charcoal-700">You haven't claimed any donations yet — browse what's available nearby.</p>
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
  );
}
