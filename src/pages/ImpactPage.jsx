import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatTile from "../components/StatTile.jsx";
import Avatar from "../components/Avatar.jsx";
import { donorTier, orgTier, getNextTier, DONOR_TIERS, ORG_TIERS } from "../utils/gamification.js";

const TERRACOTTA = "#c1602f";
const GRID = "#efe0c2";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-charcoal-900/10 bg-cream-50 px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-charcoal-900">{label}</p>
      <p className="text-charcoal-700">{payload[0].value} meals shared</p>
    </div>
  );
}

function HeroCard({ user, rank }) {
  const isDonor = user.role === "donor";
  const metricValue = isDonor ? user.impact?.mealsShared ?? 0 : user.impact?.donationsCompleted ?? 0;
  const tier = isDonor ? donorTier(metricValue) : orgTier(metricValue);
  const nextTier = getNextTier(metricValue, isDonor ? DONOR_TIERS : ORG_TIERS);
  const unitLabel = isDonor ? "meals" : "pickups";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-terracotta-500/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-olive-500/10" aria-hidden="true" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full ring-4 ring-terracotta-300">
            <Avatar name={user.orgName || user.name} size={72} />
          </div>
          <div>
            <p className="text-sm text-charcoal-700">Welcome back</p>
            <h2 className="font-display text-xl font-semibold text-charcoal-900 sm:text-2xl">{user.orgName || user.name}</h2>
            <span className="mt-1 inline-block rounded-full bg-terracotta-100 px-2.5 py-0.5 text-xs font-semibold text-terracotta-700">
              {tier.emoji} {tier.label}
            </span>
          </div>
        </div>

        {rank && (
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 self-start rounded-2xl bg-gold-300/30 px-4 py-3 transition-colors hover:bg-gold-300/50 sm:self-auto"
          >
            <span className="text-2xl">🏅</span>
            <span className="text-sm text-charcoal-800">
              Ranked <strong className="font-display text-lg">#{rank}</strong> all-time
            </span>
          </Link>
        )}
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-cream-100 px-4 py-3">
          <p className="font-sans text-2xl font-semibold text-terracotta-600">{user.impact?.donationsCompleted ?? 0}</p>
          <p className="text-xs text-charcoal-700">Donations completed</p>
        </div>
        <div className="rounded-2xl bg-cream-100 px-4 py-3">
          <p className="font-sans text-2xl font-semibold text-terracotta-600">{user.impact?.mealsShared ?? 0}</p>
          <p className="text-xs text-charcoal-700">Meals shared</p>
        </div>
      </div>

      {nextTier && (
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-charcoal-700">
            <span>{tier.emoji} {tier.label}</span>
            <span>{nextTier.emoji} {nextTier.label} at {nextTier.threshold}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-terracotta-300 to-terracotta-500"
              style={{ width: `${Math.min(100, Math.round((metricValue / nextTier.threshold) * 100))}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-charcoal-700">
            {nextTier.threshold - metricValue} more {unitLabel} to reach {nextTier.label}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ImpactPage() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get("/stats/platform"), client.get("/stats/mine")])
      .then(([p, m]) => {
        setPlatform(p.data);
        setTimeline(m.data.timeline);
        setRank(m.data.rank);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Impact</h1>
      <p className="mt-2 text-charcoal-700">See the difference donations on Food Saver are making.</p>

      {user && <div className="mt-8"><HeroCard user={user} rank={rank} /></div>}

      {user?.role === "donor" && (
        <div className="mt-8 rounded-2xl border border-charcoal-900/10 bg-cream-50 p-6">
          <h3 className="font-display text-lg font-semibold text-charcoal-900">Meals shared over time</h3>
          {timeline.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-700">
              Once your donations are delivered, your daily meals-shared trend will show up here.
            </p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mealsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TERRACOTTA} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={TERRACOTTA} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#4a3d30" }} axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4a3d30" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="meals"
                    stroke={TERRACOTTA}
                    strokeWidth={2}
                    fill="url(#mealsFill)"
                    activeDot={{ r: 4, stroke: "#fdf9f1", strokeWidth: 2 }}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <section className="relative mt-10 overflow-hidden rounded-3xl bg-olive-700 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cream-50/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-cream-50/5" aria-hidden="true" />
        <h2 className="relative text-center font-display text-xl font-semibold text-cream-50 sm:text-2xl">
          Platform-wide impact
        </h2>
        <div className="relative mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile dark icon="🍽️" label="Meals shared" value={loading ? "—" : platform.mealsShared} delay={0} />
          <StatTile dark icon="📦" label="Donations completed" value={loading ? "—" : platform.donationsCompleted} delay={0.12} />
          <StatTile dark icon="📋" label="Live listings" value={loading ? "—" : platform.activeDonations} delay={0.24} />
          <StatTile dark icon="🤝" label="Active NGOs / volunteers" value={loading ? "—" : platform.activeOrganizations} delay={0.36} />
        </div>
      </section>
    </div>
  );
}
