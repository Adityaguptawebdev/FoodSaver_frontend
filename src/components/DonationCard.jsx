import StatusBadge from "./StatusBadge.jsx";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5050/api").replace(/\/api\/?$/, "");

// Cloudinary URLs are already absolute; older local-disk uploads were relative
// paths like "/uploads/xyz.jpg" and need the API origin prepended.
function resolveImageUrl(url) {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}

function timeUntil(dateStr) {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  if (diffMs <= 0) return "Past safe window";
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Less than 1 hour left";
  if (hours < 24) return `${hours}h left to pick up`;
  return `${Math.round(hours / 24)}d left to pick up`;
}

const TAKEN_LABEL = {
  claimed: "Already claimed",
  out_for_pickup: "Out for pickup",
  picked_up: "Picked up",
  delivered: "Delivered",
  expired: "No longer available",
  cancelled: "No longer available",
};

function formatDistance(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export default function DonationCard({ donation, footer, muted = false, pickupPhotoUrl, distanceKm }) {
  const { title, description, foodType, quantity, unit, photoUrl, safeUntil, pickupAddress, donor, ai, status, location } =
    donation;

  const isTaken = status !== "available";
  const mapHref =
    location?.coordinates?.length === 2
      ? `https://www.google.com/maps/search/?api=1&query=${location.coordinates[1]},${location.coordinates[0]}`
      : null;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-charcoal-900/10 bg-cream-50 shadow-sm transition-shadow hover:shadow-md ${
        muted && isTaken ? "opacity-70" : ""
      }`}
    >
      <div className="relative h-40 w-full bg-cream-200">
        {photoUrl ? (
          <img src={resolveImageUrl(photoUrl)} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍲</div>
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </div>
        {muted && isTaken && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/40">
            <span className="rounded-full bg-charcoal-900/80 px-4 py-1.5 text-sm font-semibold text-cream-50">
              {TAKEN_LABEL[status] || "No longer available"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-charcoal-900">{title}</h3>
          <span className="whitespace-nowrap rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-semibold capitalize text-charcoal-700">
            {foodType}
          </span>
        </div>

        <p className="text-sm text-charcoal-700">
          {ai?.generatedDescription || description || "No description provided."}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {ai?.category && (
            <span className="rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-medium text-terracotta-700">
              ✨ {ai.category}
            </span>
          )}
          {ai?.allergens?.map((a) => (
            <span key={a} className="rounded-full bg-gold-300/40 px-2 py-0.5 text-xs font-medium text-gold-600">
              {a}
            </span>
          ))}
        </div>

        <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-charcoal-700">
          <dt className="font-medium">Quantity</dt>
          <dd>{ai?.estimatedServings || quantity} {unit}</dd>
          <dt className="font-medium">Pickup at</dt>
          <dd className="truncate">
            {mapHref ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-600 underline decoration-dotted underline-offset-2 hover:text-terracotta-700"
                onClick={(e) => e.stopPropagation()}
              >
                📍 {pickupAddress}
              </a>
            ) : (
              pickupAddress
            )}
            {distanceKm != null && (
              <span className="ml-1.5 whitespace-nowrap rounded-full bg-olive-100 px-2 py-0.5 text-xs font-medium text-olive-700">
                {formatDistance(distanceKm)}
              </span>
            )}
          </dd>
          <dt className="font-medium">Window</dt>
          <dd>{timeUntil(safeUntil)}</dd>
          {donor?.name && (
            <>
              <dt className="font-medium">Donor</dt>
              <dd className="truncate">{donor.orgName || donor.name}</dd>
            </>
          )}
        </dl>

        {ai?.shelfLifeNote && (
          <p className="mt-1 rounded-lg bg-olive-100 px-3 py-2 text-xs text-olive-700">
            🛡️ {ai.shelfLifeNote}
          </p>
        )}

        {pickupPhotoUrl && (
          <div className="mt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-700">Proof of pickup</p>
            <img
              src={resolveImageUrl(pickupPhotoUrl)}
              alt="Proof of pickup"
              className="mt-1 h-28 w-full rounded-lg object-cover"
            />
          </div>
        )}

        {footer && <div className="mt-auto pt-3">{footer}</div>}
      </div>
    </div>
  );
}
