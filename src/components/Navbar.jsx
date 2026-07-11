import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";

const linkClasses = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${isActive ? "text-terracotta-600" : "text-charcoal-700 hover:text-terracotta-600"}`;

const mobileLinkClasses = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-base font-semibold transition-colors ${
    isActive ? "bg-terracotta-100 text-terracotta-600" : "text-charcoal-700 hover:bg-cream-200"
  }`;

function NavLinks({ user, className, linkClass, onNavigate }) {
  return (
    <nav className={className}>
      {!user && (
        <NavLink to="/" className={linkClass} end onClick={onNavigate}>
          How it works
        </NavLink>
      )}
      {user?.role === "donor" && (
        <>
          <NavLink to="/donate" className={linkClass} onClick={onNavigate}>Post donation</NavLink>
          <NavLink to="/my-donations" className={linkClass} onClick={onNavigate}>My donations</NavLink>
        </>
      )}
      {(user?.role === "ngo" || user?.role === "volunteer") && (
        <>
          <NavLink to="/browse" className={linkClass} onClick={onNavigate}>Browse donations</NavLink>
          <NavLink to="/my-claims" className={linkClass} onClick={onNavigate}>My claims</NavLink>
        </>
      )}
      {user && <NavLink to="/impact" className={linkClass} onClick={onNavigate}>Impact</NavLink>}
      <NavLink to="/leaderboard" className={linkClass} onClick={onNavigate}>Leaderboard</NavLink>
    </nav>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-charcoal-900/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal-900" onClick={closeMenu}>
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          Food Saver
        </Link>

        <NavLinks user={user} className="hidden items-center gap-6 md:flex" linkClass={linkClasses} />

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-charcoal-700">Hi, {user.orgName || user.name.split(" ")[0]}</span>
              <Button variant="ghost" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost">Log in</Button>
              <Button as={Link} to="/register" variant="primary">Get started</Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-900 hover:bg-cream-200 md:hidden"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-charcoal-900/10 bg-cream-50 px-4 pb-4 pt-2 md:hidden">
          <NavLinks user={user} className="flex flex-col gap-1" linkClass={mobileLinkClasses} onNavigate={closeMenu} />
          <div className="mt-3 flex flex-col gap-2 border-t border-charcoal-900/10 pt-3">
            {user ? (
              <>
                <span className="px-3 text-sm text-charcoal-700">
                  Signed in as {user.orgName || user.name}
                </span>
                <Button variant="ghost" onClick={handleLogout} className="w-full">Log out</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" className="w-full" onClick={closeMenu}>Log in</Button>
                <Button as={Link} to="/register" variant="primary" className="w-full" onClick={closeMenu}>Get started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
