export const AVATAR_COLORS = ["#c1602f", "#6b7a3f", "#a34e23", "#57642f", "#833d19", "#414c21"];

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Sorted descending by threshold - first match wins.
export const DONOR_TIERS = [
  { threshold: 100, label: "Food Hero", emoji: "🌿" },
  { threshold: 50, label: "Community Star", emoji: "❤️" },
  { threshold: 20, label: "Eco Warrior", emoji: "🌍" },
  { threshold: 5, label: "Rising Donor", emoji: "⭐" },
  { threshold: 0, label: "New Donor", emoji: "🌱" },
];

export const ORG_TIERS = [
  { threshold: 30, label: "Champion Partner", emoji: "🏅" },
  { threshold: 15, label: "Trusted Partner", emoji: "🤝" },
  { threshold: 5, label: "Active Partner", emoji: "🌟" },
  { threshold: 0, label: "New Partner", emoji: "🆕" },
];

export function getTier(value, tiers) {
  return tiers.find((t) => value >= t.threshold) || tiers[tiers.length - 1];
}

// Next tier up from the current value, or null if already at the top tier.
export function getNextTier(value, tiers) {
  const ascending = [...tiers].sort((a, b) => a.threshold - b.threshold);
  return ascending.find((t) => t.threshold > value) || null;
}

export function donorTier(meals) {
  return getTier(meals, DONOR_TIERS);
}

export function orgTier(pickups) {
  return getTier(pickups, ORG_TIERS);
}
