import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { haversineKm } from "../utils/distance.js";
import DonationCard from "../components/DonationCard.jsx";
import DonationCardSkeleton from "../components/DonationCardSkeleton.jsx";
import Button from "../components/Button.jsx";

// Landing page for a notification click: shows one donation and lets the
// NGO/volunteer claim it directly, or explains that it's already gone.
export default function DonationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    let ignore = false;
    // Notification clicks arrive from wherever the user had scrolled to; start at the item.
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);
    setClaimError("");
    client
      .get(`/donations/${id}`)
      .then((res) => {
        if (!ignore) setDonation(res.data.donation);
      })
      .catch(() => {
        if (!ignore) setNotFound(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleClaim() {
    setClaiming(true);
    setClaimError("");
    try {
      await client.post(`/claims/${donation._id}`);
      navigate("/my-claims");
    } catch (err) {
      setClaimError(err.response?.data?.message || "Couldn't claim this donation — it may already be taken.");
      // Refresh so the card reflects whoever claimed it first.
      client.get(`/donations/${id}`).then((res) => setDonation(res.data.donation)).catch(() => {});
    } finally {
      setClaiming(false);
    }
  }

  const [userLng, userLat] = user.location?.coordinates || [0, 0];
  const distanceKm =
    donation?.location?.coordinates?.length === 2 && (userLng || userLat)
      ? haversineKm(userLat, userLng, donation.location.coordinates[1], donation.location.coordinates[0])
      : null;
  const isAvailable = donation?.status === "available";

  return (
    <div className="texture-grain min-h-[calc(100vh-73px)] bg-cream-100">
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <Link to="/browse" className="text-sm font-semibold text-terracotta-600 hover:underline">
          ← Browse all donations
        </Link>

        <div className="mt-4">
          {loading ? (
            <DonationCardSkeleton />
          ) : notFound ? (
            <div className="rounded-3xl border border-dashed border-charcoal-900/20 bg-cream-50 px-6 py-14 text-center">
              <p className="text-4xl">🔍</p>
              <h1 className="mt-3 font-display text-xl font-semibold text-charcoal-900">Donation not found</h1>
              <p className="mt-2 text-charcoal-700">It may have been removed. Check what else is available nearby.</p>
              <Button as={Link} to="/browse" variant="primary" className="mt-6">
                Browse donations
              </Button>
            </div>
          ) : (
            <DonationCard
              donation={donation}
              distanceKm={distanceKm}
              muted
              footer={
                isAvailable ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="primary" className="w-full text-sm" disabled={claiming} onClick={handleClaim}>
                      {claiming ? "Claiming…" : "Claim this donation"}
                    </Button>
                    {claimError && <p className="text-xs text-danger-500">{claimError}</p>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-sm text-charcoal-700">
                      {claimError || "This donation isn't available any more."}
                    </p>
                    <Button as={Link} to="/browse" variant="outline" className="w-full text-sm">
                      Browse other donations
                    </Button>
                  </div>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
