const STATUS_META = {
  available: { label: "Available", classes: "bg-olive-100 text-olive-700" },
  claimed: { label: "Claimed", classes: "bg-gold-300/50 text-gold-600" },
  out_for_pickup: { label: "Out for pickup", classes: "bg-terracotta-100 text-terracotta-700" },
  picked_up: { label: "Picked up", classes: "bg-terracotta-100 text-terracotta-700" },
  delivered: { label: "Delivered", classes: "bg-olive-500 text-cream-50" },
  expired: { label: "Expired", classes: "bg-charcoal-800/10 text-charcoal-700" },
  cancelled: { label: "Cancelled", classes: "bg-danger-500/10 text-danger-600" },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, classes: "bg-cream-200 text-charcoal-700" };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${meta.classes}`}>
      {meta.label}
    </span>
  );
}
