import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { donorTier, orgTier } from "../utils/gamification.js";

const inputClasses =
  "rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none transition-colors focus:border-terracotta-500";

const ROLE_LABELS = {
  donor: "Donor",
  ngo: "NGO",
  volunteer: "Volunteer",
  admin: "Admin",
};

function initFormFromUser(user) {
  const [lng, lat] = user.location?.coordinates || [0, 0];
  return {
    form: {
      name: user.name || "",
      phone: user.phone || "",
      orgName: user.orgName || "",
      address: user.address || "",
    },
    coords: lng || lat ? { lng, lat } : null,
  };
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const initial = initFormFromUser(user);
  const [form, setForm] = useState(initial.form);
  const [coords, setCoords] = useState(initial.coords);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);

  const isNgo = user.role === "ngo";
  const metricValue = user.role === "donor" ? user.impact?.mealsShared ?? 0 : user.impact?.donationsCompleted ?? 0;
  const tier = user.role === "donor" ? donorTier(metricValue) : orgTier(metricValue);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function pickAvatar() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }

  function confirmLogout() {
    logout();
    setLogoutConfirmOpen(false);
    navigate("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (coords) {
        data.append("lng", coords.lng);
        data.append("lat", coords.lat);
      }
      if (avatarFile) data.append("avatar", avatarFile);

      const res = await client.patch("/auth/me", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      setAvatarFile(null);
      setAvatarPreview(res.data.user.avatarUrl || "");
      showToast("Profile updated ✓");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full bg-charcoal-900 px-5 py-2.5 text-center text-sm font-medium text-cream-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-gradient-to-br from-cream-100 to-cream-200/60 px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-terracotta-500/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-olive-500/10" aria-hidden="true" />

        <div className="relative">
          <span className="inline-block rounded-full bg-terracotta-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta-700">
            Your profile
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">
            Manage your account
          </h1>
          <p className="mt-2 max-w-md text-sm text-charcoal-700 sm:text-base">
            Update your details, swap your photo, and keep your pickup location accurate.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 text-center shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-terracotta-500 to-transparent opacity-60" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-terracotta-500/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-olive-500/10" aria-hidden="true" />

          <div className="relative mx-auto w-fit">
            <div className="rounded-full ring-4 ring-terracotta-300">
              <Avatar name={user.orgName || user.name} src={avatarPreview} size={120} />
            </div>
            <button
              type="button"
              onClick={pickAvatar}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-50 bg-terracotta-500 text-cream-50 shadow-md transition-colors hover:bg-terracotta-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
                <circle cx="12" cy="13.5" r="3.2" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <h2 className="relative mt-4 font-display text-lg font-semibold text-charcoal-900">
            {user.orgName || user.name}
          </h2>
          <p className="relative text-sm text-charcoal-700">{user.email}</p>

          <div className="relative mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-semibold text-charcoal-700">
              {ROLE_LABELS[user.role] || user.role}
            </span>
            {isNgo && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.isVerifiedNgo ? "bg-olive-100 text-olive-700" : "bg-gold-300/40 text-gold-600"
                }`}
              >
                {user.isVerifiedNgo ? "Verified NGO" : "Pending verification"}
              </span>
            )}
            <span className="rounded-full bg-terracotta-100 px-2.5 py-0.5 text-xs font-semibold text-terracotta-700">
              {tier.emoji} {tier.label}
            </span>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-charcoal-900/10 pt-5 text-left">
            <div>
              <p className="font-display text-xl font-semibold text-charcoal-900">{user.impact?.donationsCompleted ?? 0}</p>
              <p className="text-xs text-charcoal-700">Donations</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-charcoal-900">{user.impact?.mealsShared ?? 0}</p>
              <p className="text-xs text-charcoal-700">Meals shared</p>
            </div>
          </div>
          <Link to="/impact" className="relative mt-4 inline-block text-xs font-semibold text-terracotta-600 hover:underline">
            View full impact →
          </Link>

          <div className="relative mt-5 border-t border-charcoal-900/10 pt-5">
            <Button
              type="button"
              variant="outline"
              className="w-full py-2 text-sm"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              Log out
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 shadow-sm sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-terracotta-500 to-transparent opacity-60" />

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">Personal details</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={inputClasses}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
              Email
              <input value={user.email} disabled className={`${inputClasses} cursor-not-allowed opacity-60`} />
            </label>

            {isNgo && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Organization name
                <input
                  value={form.orgName}
                  onChange={(e) => update("orgName", e.target.value)}
                  className={inputClasses}
                />
              </label>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-charcoal-900/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">Location</p>
            <LocationPicker
              address={form.address}
              onAddressChange={(value) => update("address", value)}
              coords={coords}
              onCoordsChange={setCoords}
            />
          </div>

          {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

          <div className="mt-6 flex justify-end border-t border-charcoal-900/10 pt-6">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </motion.div>
      </form>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log out?"
        body="You'll need to log in again to access your account."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        confirmVariant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
