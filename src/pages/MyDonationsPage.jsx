import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import DonationCard from "../components/DonationCard.jsx";
import { DonationGridSkeleton } from "../components/DonationCardSkeleton.jsx";
import Button from "../components/Button.jsx";
import donationBannerImage from "../assets/illustrations/banner.png";

const CLAIMED_STATUSES = ["claimed", "out_for_pickup", "picked_up"];
const POLL_MS = 8000;

function ClaimPanel({ claim }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gold-300/30 p-3 text-sm">
      <p className="text-charcoal-700">
        Claimed by <strong>{claim.claimedBy?.orgName || claim.claimedBy?.name}</strong>
        {claim.claimedBy?.phone && ` · ${claim.claimedBy.phone}`}
      </p>
      {showCode ? (
        <p className="text-center font-display text-2xl font-bold tracking-widest text-terracotta-700">
          {claim.handoffCode}
        </p>
      ) : (
        <Button variant="outline" className="w-full py-1.5 text-sm" onClick={() => setShowCode(true)}>
          Show pickup code
        </Button>
      )}
      {claim.pickupPhotoUrl && (
        <p className="text-xs text-olive-700">✅ Pickup confirmed with photo proof</p>
      )}
    </div>
  );
}

export default function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [claims, setClaims] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const prevStatuses = useRef({});
  const toastTimer = useRef(null);

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const res = await client.get("/donations/mine");
      const next = res.data.donations;

      // Detect a fresh claim on a donation that was previously available, and surface it as a toast.
      for (const d of next) {
        const prev = prevStatuses.current[d._id];
        if (prev === "available" && d.status !== "available") {
          setToast(`🎉 "${d.title}" was just claimed!`);
          clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(""), 6000);
        }
      }
      prevStatuses.current = Object.fromEntries(next.map((d) => [d._id, d.status]));
      setDonations(next);

      const claimTargets = next.filter((d) => CLAIMED_STATUSES.includes(d.status));
      const entries = await Promise.all(
        claimTargets.map((d) =>
          client
            .get(`/claims/donation/${d._id}`)
            .then((r) => [d._id, r.data.claim])
            .catch(() => [d._id, null])
        )
      );
      setClaims(Object.fromEntries(entries));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load({ silent: true }), POLL_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleCancel(id) {
    await client.patch(`/donations/${id}/cancel`);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full bg-charcoal-900 px-5 py-2.5 text-center text-sm font-medium text-cream-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-gradient-to-br from-cream-100 to-cream-200/60 px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-terracotta-500/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-olive-500/10" aria-hidden="true" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <span className="inline-block rounded-full bg-olive-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-olive-700">
              Your donations
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">
              Every donation you post, tracked to the plate.
            </h1>
            <p className="mt-2 max-w-md text-sm text-charcoal-700 sm:text-base">
              From posting surplus food to a confirmed handoff — see the full journey of everything you've shared.
            </p>
            <div className="mt-5">
              <Button as={Link} to="/donate" variant="primary">Post another</Button>
            </div>
          </div>

          <img src={donationBannerImage} alt="" className="h-40 w-auto sm:h-52" />
        </div>
      </div>

      {loading ? (
        <DonationGridSkeleton />
      ) : donations.length === 0 ? (
        <p className="mt-8 text-charcoal-700">You haven't posted any donations yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donations.map((d) => (
            <DonationCard
              key={d._id}
              donation={d}
              pickupPhotoUrl={claims[d._id]?.pickupPhotoUrl}
              footer={
                d.status === "available" ? (
                  <Button variant="danger" className="w-full text-sm" onClick={() => handleCancel(d._id)}>
                    Cancel donation
                  </Button>
                ) : claims[d._id] ? (
                  <ClaimPanel claim={claims[d._id]} />
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
