import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import Button from "../components/Button.jsx";
import StatTile from "../components/StatTile.jsx";
import DonationCard from "../components/DonationCard.jsx";
import { DonationGridSkeleton } from "../components/DonationCardSkeleton.jsx";
import FlowArrow from "../components/FlowArrow.jsx";
import StepCard from "../components/StepCard.jsx";
import HeroIllustration from "../components/HeroIllustration.jsx";
import bannerImg from "../assets/illustrations/banner.png";
import locationImg from "../assets/illustrations/location.png";
import foodHandoverImg from "../assets/illustrations/food-handover.png";
import foodCarryImg from "../assets/illustrations/food-carry.png";
import completeImg from "../assets/illustrations/complete.png";
import liveImg from "../assets/illustrations/live.png";

const STEPS = [
  {
    image: bannerImg,
    title: "Post surplus food",
    body: "Restaurants, event organizers, or households log what's left over, how much, and the safe pickup window.",
  },
  {
    image: locationImg,
    title: "Nearby NGOs get matched",
    body: "Verified NGOs and volunteers within range see the listing the moment it goes live — no scrolling through irrelevant posts.",
  },
  {
    image: foodHandoverImg,
    title: "Pickup, verified",
    body: "A handoff code confirms the food actually changed hands, and both sides track it through to delivery.",
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    client
      .get("/stats/platform")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));

    client
      .get("/donations/recent")
      .then((res) => setRecent(res.data.donations))
      .catch(() => setRecent([]))
      .finally(() => setRecentLoading(false));
  }, []);

  return (
    <div>
      <section className="texture-grain relative overflow-hidden bg-cream-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="inline-block rounded-full bg-olive-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-olive-700">
              Surplus food, rescued in hours not days
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-charcoal-900 sm:text-4xl md:text-5xl">
              Good food shouldn't go to waste.
              <span className="block text-terracotta-600">Get it to someone who needs it.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-charcoal-700 sm:text-lg">
              Food Saver connects restaurants and individuals with surplus food to nearby NGOs and volunteers —
              matched by location, tracked from post to plate.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button as={Link} to="/register" variant="primary" className="px-7 py-3 text-base">
                Donate food
              </Button>
              <Button as={Link} to="/register" variant="outline" className="px-7 py-3 text-base">
                Join as NGO / volunteer
              </Button>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <h2 className="text-center font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-charcoal-700">
          From a spare tray of food to a delivered meal, in three steps.
        </p>
        <div className="mt-12 flex flex-col gap-y-4 md:flex-row md:items-stretch md:gap-y-0">
          {STEPS.map((step, i) => (
            <div key={step.title} className="contents">
              <StepCard image={step.image} title={step.title} body={step.body} index={i} />
              {i < STEPS.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-200/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Live right now</h2>
              <p className="mt-1 text-charcoal-700">Real donations posted on Food Saver, updated live.</p>
            </div>
            <Button as={Link} to="/register" variant="outline">
              Sign up to claim or donate
            </Button>
          </div>

          {recentLoading ? (
            <DonationGridSkeleton />
          ) : recent.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-charcoal-900/20 bg-cream-50 p-8 text-center text-charcoal-700">
              No donations posted yet — be the first!
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((d) => (
                <DonationCard key={d._id} donation={d} muted />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-olive-700 py-16 md:py-20">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cream-50/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cream-50/5"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-cream-50 sm:text-3xl">Our impact so far</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-cream-100/80">
            Real numbers from real rescues, updated as donations move from posted to delivered.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            <StatTile dark icon={<img src={bannerImg} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />} label="Meals shared" value={stats ? stats.mealsShared : "—"} delay={0} />
            <StatTile dark icon={<img src={completeImg} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />} label="Donations completed" value={stats ? stats.donationsCompleted : "—"} delay={0.12} />
            <StatTile dark icon={<img src={liveImg} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />} label="Live listings" value={stats ? stats.activeDonations : "—"} delay={0.24} />
            <StatTile dark icon={<img src={foodCarryImg} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />} label="Active NGOs / volunteers" value={stats ? stats.activeOrganizations : "—"} delay={0.36} />
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/10 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-cream-50/20"
            >
              🏆 See who's leading the pack
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-charcoal-700">
        Food Saver — a self-initiated project to reduce food waste, one donation at a time.
      </footer>
    </div>
  );
}
