import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./Button.jsx";
import Avatar from "./Avatar.jsx";

const linkClasses = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${isActive ? "text-terracotta-600" : "text-charcoal-700 hover:text-terracotta-600"}`;

const mobileLinkClasses = ({ isActive }) =>
  `block rounded-lg px-3 py-2.5 text-base font-semibold transition-colors ${
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
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-charcoal-900/10 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-charcoal-900" onClick={closeMenu}>
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          Food Saver
        </Link>

        <NavLinks user={user} className="hidden items-center gap-6 md:flex" linkClass={linkClasses} />

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to="/profile"
              className="group flex items-center gap-2.5 rounded-full border border-charcoal-900/10 bg-cream-100/60 py-1 pl-1 pr-4 text-sm font-medium text-charcoal-800 shadow-sm transition-all hover:border-terracotta-300 hover:bg-cream-100 hover:shadow-md"
              onClick={closeMenu}
            >
              <span className="rounded-full ring-2 ring-cream-50 transition-shadow group-hover:ring-terracotta-300">
                <Avatar name={user.orgName || user.name} src={user.avatarUrl} size={30} />
              </span>
              Hi, {user.orgName || user.name.split(" ")[0]}
            </Link>
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
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-900 hover:bg-cream-200 md:hidden"
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
    </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 h-screen w-screen bg-charcoal-900/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              aria-hidden="true"
            />
            <motion.div
              className="fixed inset-0 z-40 h-screen w-screen overflow-y-auto bg-cream-50 shadow-xl md:hidden"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="px-4 pb-6 pt-4" style={{ paddingTop: headerHeight + 16 }}>
                <NavLinks user={user} className="flex flex-col gap-1" linkClass={mobileLinkClasses} onNavigate={closeMenu} />
                <div className="mt-3 flex flex-col gap-2 border-t border-charcoal-900/10 pt-3">
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-xl border border-charcoal-900/10 bg-cream-100/60 px-3 py-2.5 text-sm text-charcoal-800 transition-colors hover:bg-cream-200"
                    >
                      <Avatar name={user.orgName || user.name} src={user.avatarUrl} size={36} />
                      <span>
                        <span className="block font-semibold">{user.orgName || user.name}</span>
                        <span className="block text-xs text-charcoal-700">View profile</span>
                      </span>
                    </Link>
                  ) : (
                    <>
                      <Button as={Link} to="/login" variant="ghost" className="w-full" onClick={closeMenu}>Log in</Button>
                      <Button as={Link} to="/register" variant="primary" className="w-full" onClick={closeMenu}>Get started</Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
