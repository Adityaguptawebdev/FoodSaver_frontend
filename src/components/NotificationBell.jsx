import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import { resolveImageUrl } from "../utils/imageUrl.js";
import { formatDistance } from "../utils/distance.js";
import {
  isNotificationSoundOn,
  setNotificationSoundOn,
  unlockNotificationSound,
  playNotificationSound,
} from "../utils/notificationSound.js";
import StatusBadge from "./StatusBadge.jsx";

function timeAgo(dateStr) {
  const minutes = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationBell({ onOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isNotificationSoundOn);
  const { notifications, unreadCount, listLoaded, listError, retryList, markRead, markAllRead } = useNotifications(open);
  const wrapperRef = useRef(null);

  const [lng, lat] = user.location?.coordinates || [0, 0];
  const hasLocation = Boolean(lng || lat);
  const items = notifications.filter((n) => n.donation);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) onOpen?.();
    setOpen((o) => !o);
  }

  function toggleSound() {
    const next = !soundOn;
    setNotificationSoundOn(next);
    setSoundOn(next);
    if (next) {
      unlockNotificationSound();
      playNotificationSound(); // preview, so turning it on confirms what alerts will sound like
    }
  }

  function openNotification(notification) {
    markRead(notification);
    setOpen(false);
    navigate(`/donations/${notification.donation._id}`);
  }

  return (
    // Not positioned on mobile, so the dropdown anchors to the full-width header instead of
    // the bell and keeps a 16px gutter on both sides of a narrow screen.
    <div ref={wrapperRef} className="md:relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal-900 transition-colors hover:bg-cream-200"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 10a6 6 0 1 1 12 0c0 4.5 2 6 2 6H4s2-1.5 2-6z" strokeLinejoin="round" />
          <path d="M10 19.5a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta-500 px-1 text-[10px] font-bold leading-none text-cream-50 ring-2 ring-cream-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-charcoal-900/10 bg-cream-50 shadow-xl md:left-auto md:right-0 md:w-80"
          >
            <div className="flex items-center justify-between border-b border-charcoal-900/10 px-3.5 py-2">
              <p className="font-display text-sm font-semibold text-charcoal-900">Notifications</p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-terracotta-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={soundOn}
                  aria-label={soundOn ? "Mute alert sound" : "Unmute alert sound"}
                  title={soundOn ? "Mute alert sound" : "Unmute alert sound"}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-cream-200 hover:text-charcoal-900"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5 6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
                    {soundOn ? (
                      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
                    ) : (
                      <path d="m16 9 6 6m0-6-6 6" strokeLinecap="round" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {!listLoaded && listError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-charcoal-700">Couldn't load notifications.</p>
                <button
                  type="button"
                  onClick={retryList}
                  className="mt-2 text-sm font-semibold text-terracotta-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : !listLoaded ? (
              <p className="px-4 py-8 text-center text-sm text-charcoal-700">Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-3xl">🔔</p>
                {hasLocation ? (
                  <p className="mt-2 text-sm text-charcoal-700">
                    No alerts yet. We'll let you know when food is posted within {user.notifyRadiusKm ?? 10} km of you.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-charcoal-700">
                    <Link to="/profile" onClick={() => setOpen(false)} className="font-semibold text-terracotta-600 hover:underline">
                      Set your location
                    </Link>{" "}
                    to get alerts about food posted near you.
                  </p>
                )}
              </div>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-charcoal-900/10 overflow-y-auto">
                {items.map((n) => (
                  <li key={n._id}>
                    <button
                      type="button"
                      onClick={() => openNotification(n)}
                      className={`flex w-full gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-cream-200 ${
                        n.readAt ? "" : "bg-terracotta-100/40"
                      }`}
                    >
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                        {n.donation.photoUrl ? (
                          <img src={resolveImageUrl(n.donation.photoUrl)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-base">🍲</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] leading-snug text-charcoal-900">
                          <span className="font-semibold">New food nearby:</span> {n.donation.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-charcoal-700">
                          {[`${n.donation.quantity} ${n.donation.unit}`, formatDistance(n.distanceKm), timeAgo(n.createdAt)]
                            .filter(Boolean)
                            .join(" · ")}
                          {n.donation.status !== "available" && <StatusBadge status={n.donation.status} size="sm" />}
                        </span>
                      </span>
                      {!n.readAt && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta-500" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
