import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const columnLinkClass = "text-sm text-charcoal-700 transition-colors hover:text-terracotta-600";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-charcoal-900/10 bg-cream-200/60">
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-2 sm:py-14 md:grid-cols-4 md:py-16">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal-900">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            Food Saver
          </Link>
          <p className="mt-3 max-w-xs text-sm text-charcoal-700">
            A self-initiated project to reduce food waste, one donation at a time — connecting surplus food with the
            people who need it.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-charcoal-900">Explore</h3>
          <nav className="mt-4 flex flex-col gap-2.5">
            <Link to="/" className={columnLinkClass}>How it works</Link>
            <Link to="/leaderboard" className={columnLinkClass}>Leaderboard</Link>
            {user && <Link to="/impact" className={columnLinkClass}>Impact</Link>}
          </nav>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-charcoal-900">Get involved</h3>
          <nav className="mt-4 flex flex-col gap-2.5">
            {user?.role === "donor" ? (
              <>
                <Link to="/donate" className={columnLinkClass}>Post a donation</Link>
                <Link to="/my-donations" className={columnLinkClass}>My donations</Link>
              </>
            ) : user?.role === "ngo" || user?.role === "volunteer" ? (
              <>
                <Link to="/browse" className={columnLinkClass}>Browse donations</Link>
                <Link to="/my-claims" className={columnLinkClass}>My claims</Link>
              </>
            ) : (
              <>
                <Link to="/register" className={columnLinkClass}>Donate food</Link>
                <Link to="/register" className={columnLinkClass}>Join as NGO / volunteer</Link>
              </>
            )}
          </nav>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-charcoal-900">Account</h3>
          <nav className="mt-4 flex flex-col gap-2.5">
            {user ? (
              <Link to="/profile" className={columnLinkClass}>Profile</Link>
            ) : (
              <>
                <Link to="/login" className={columnLinkClass}>Log in</Link>
                <Link to="/register" className={columnLinkClass}>Get started</Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="border-t border-charcoal-900/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-6 text-center text-xs text-charcoal-700/70 sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Food Saver. Built to keep good food off the trash pile.</p>
          <p>Made with care, one rescued meal at a time.</p>
        </div>
      </div>
    </footer>
  );
}
