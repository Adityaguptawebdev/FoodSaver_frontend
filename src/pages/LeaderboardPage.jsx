import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import { donorTier, orgTier } from "../utils/gamification.js";

const MEDALS = ["🥇", "🥈", "🥉"];
const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

const PODIUM_ORDER = [1, 0, 2];
const PODIUM_STYLES = [
  { avatarSize: 88, standHeight: 96, ring: "ring-gold-400", crown: true },
  { avatarSize: 68, standHeight: 64, ring: "ring-charcoal-700/25", crown: false },
  { avatarSize: 68, standHeight: 40, ring: "ring-terracotta-300", crown: false },
];

function Podium({ top3 }) {
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-4 pb-2 sm:gap-8">
      {PODIUM_ORDER.map((rankIdx, position) => {
        const person = top3[rankIdx];
        if (!person) return null;
        const style = PODIUM_STYLES[rankIdx];
        const tier = donorTier(person.mealsShared);
        const standDelay = 0.1 + position * 0.2;
        const avatarDelay = standDelay + 0.35;

        return (
          <div key={person.id} className="flex flex-col items-center">
            <div className="relative mb-2">
              {style.crown && (
                <motion.span
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl"
                  initial={{ opacity: 0, y: -16, rotate: -15 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: avatarDelay + 0.3, duration: 0.5, ease: "backOut" }}
                >
                  👑
                </motion.span>
              )}
              {rankIdx === 0 && (
                <>
                  <motion.span
                    className="absolute -left-4 -top-2 text-sm"
                    aria-hidden="true"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
                    transition={{ delay: avatarDelay + 0.6, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✦
                  </motion.span>
                  <motion.span
                    className="absolute -right-5 top-0 text-lg"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: avatarDelay + 0.4, duration: 0.4, ease: "backOut" }}
                  >
                    🎉
                  </motion.span>
                  <motion.span
                    className="absolute -right-2 top-8 text-xs"
                    aria-hidden="true"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
                    transition={{ delay: avatarDelay + 0.9, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✦
                  </motion.span>
                </>
              )}
              <motion.div
                className={`rounded-full ring-4 ${style.ring}`}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: avatarDelay, duration: 0.45, ease: "backOut" }}
              >
                <Avatar name={person.orgName || person.name} size={style.avatarSize} />
              </motion.div>
              <motion.span
                className="absolute -bottom-1 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-cream-50 text-sm shadow"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: avatarDelay + 0.15, duration: 0.4, ease: "backOut" }}
              >
                {MEDALS[rankIdx]}
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: avatarDelay + 0.25, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <p className="mt-2 max-w-[7rem] truncate text-center font-display text-sm font-semibold text-charcoal-900 sm:max-w-[9rem] sm:text-base">
                {person.orgName || person.name}
              </p>
              <span className="mt-0.5 rounded-full bg-terracotta-100 px-2 py-0.5 text-[11px] font-medium text-terracotta-700">
                {tier.emoji} {tier.label}
              </span>
              <p className="mt-1 text-sm font-bold text-terracotta-600">{person.mealsShared} meals</p>
            </motion.div>
            <motion.div
              className="mt-3 w-20 rounded-t-lg bg-gradient-to-b from-cream-200 to-cream-200/40 sm:w-28"
              initial={{ height: 0 }}
              animate={{ height: style.standHeight }}
              transition={{ delay: standDelay, duration: 0.5, ease: "easeOut" }}
            />
          </div>
        );
      })}
    </div>
  );
}

function BoardRow({ row, index, maxValue, metricKey, metricLabel, tierFn, showVerified }) {
  const pct = maxValue > 0 ? Math.max(6, Math.round((row[metricKey] / maxValue) * 100)) : 0;
  const tier = tierFn(row[metricKey]);

  return (
    <li className="flex items-center gap-3 px-1 py-2.5">
      {index < 3 ? (
        <span className="w-7 shrink-0 text-center text-lg">{MEDALS[index]}</span>
      ) : (
        <span className="w-7 shrink-0 text-center text-sm font-semibold text-charcoal-700">#{index + 1}</span>
      )}
      <Avatar name={row.orgName || row.name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium text-charcoal-900">{row.orgName || row.name}</span>
          {showVerified && row.isVerified && (
            <span className="whitespace-nowrap rounded-full bg-olive-100 px-1.5 py-0.5 text-[10px] font-semibold text-olive-700">
              ✓ Verified
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-terracotta-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-[11px] text-charcoal-700">
            {tier.emoji} {tier.label}
          </span>
        </div>
      </div>
      <span className="whitespace-nowrap text-sm font-bold text-terracotta-600">
        {row[metricKey]} {metricLabel}
      </span>
    </li>
  );
}

function Board({ title, icon, rows, metricLabel, metricKey, tierFn, emptyText, showVerified }) {
  const maxValue = rows[0]?.[metricKey] || 0;

  return (
    <div className="flex-1 rounded-2xl border border-charcoal-900/10 bg-cream-50 p-6">
      <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal-900">
        <span className="text-2xl">{icon}</span> {title}
      </h3>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-700">{emptyText}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-charcoal-900/5">
          {rows.map((row, i) => (
            <BoardRow
              key={row.id}
              row={row}
              index={i}
              maxValue={maxValue}
              metricKey={metricKey}
              metricLabel={metricLabel}
              tierFn={tierFn}
              showVerified={showVerified}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState({ topDonors: [], topOrgs: [] });
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    setLoading(true);
    client
      .get("/stats/leaderboard", { params: { period } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (!user) return;
    client
      .get("/stats/mine")
      .then((res) => setMyRank(res.data.rank))
      .catch(() => setMyRank(null));
  }, [user]);

  const myMetric = user?.role === "donor" ? user?.impact?.mealsShared : user?.impact?.donationsCompleted;
  const myMetricLabel = user?.role === "donor" ? "meals donated" : "pickups completed";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">
            🏆 Community Heroes
          </h1>
          <p className="mt-1 text-charcoal-700">Every meal shared makes a difference ❤️</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-charcoal-900/15 bg-cream-100 p-1 text-sm font-semibold sm:w-fit sm:flex sm:rounded-full">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-xl px-3 py-1.5 text-center transition-colors sm:rounded-full sm:px-4 ${
                period === p.key ? "bg-terracotta-500 text-cream-50" : "text-charcoal-700 hover:text-terracotta-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {user && myRank && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-olive-100 px-5 py-3 text-sm text-olive-700">
          <span className="text-xl">👋</span>
          <span>
            Welcome back, <strong>{user.orgName || user.name}</strong> — you're ranked <strong>#{myRank}</strong> all-time
            with <strong>{myMetric}</strong> {myMetricLabel}.
          </span>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-charcoal-700">Loading…</p>
      ) : (
        <>
          {data.topDonors.length > 0 && (
            <div className="mt-10 rounded-2xl border border-charcoal-900/10 bg-cream-100/50 pt-10">
              <Podium top3={data.topDonors.slice(0, 3)} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-6 md:flex-row">
            <Board
              title="Top Donors"
              icon="⭐"
              rows={data.topDonors}
              metricKey="mealsShared"
              metricLabel="meals"
              tierFn={donorTier}
              emptyText="No delivered donations yet this period — be the first!"
            />
            <Board
              title="Top NGOs & Volunteers"
              icon="🤝"
              rows={data.topOrgs}
              metricKey="donationsCompleted"
              metricLabel="pickups"
              tierFn={orgTier}
              emptyText="No completed pickups yet this period."
              showVerified
            />
          </div>

          <p className="mt-10 rounded-2xl bg-cream-200/60 px-6 py-4 text-center text-sm italic text-charcoal-700">
            "Small acts, when multiplied by millions of people, can transform the world." — Howard Zinn
          </p>
        </>
      )}
    </div>
  );
}
