import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useGeolocation } from "../hooks/useGeolocation.js";
import Button from "../components/Button.jsx";

const ROLES = [
  { value: "donor", label: "Donor", body: "Restaurant, event, or household with surplus food" },
  { value: "ngo", label: "NGO", body: "Registered organization distributing food to those in need" },
  { value: "volunteer", label: "Volunteer", body: "Individual who can pick up and deliver donations" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const [form, setForm] = useState({
    role: "donor",
    name: "",
    email: "",
    password: "",
    phone: "",
    orgName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        ...form,
        lng: coords?.lng,
        lat: coords?.lat,
      });
      navigate("/");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Couldn't create your account.");
      } else {
        setError("Can't reach the server right now — check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-charcoal-700">Tell us who you are so we can route donations correctly.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setForm({ ...form, role: r.value })}
            className={`rounded-2xl border-2 p-4 text-left transition-colors ${
              form.role === r.value
                ? "border-terracotta-500 bg-terracotta-100/50"
                : "border-charcoal-900/10 hover:border-terracotta-300"
            }`}
          >
            <div className="font-display font-semibold text-charcoal-900">{r.label}</div>
            <div className="mt-1 text-xs text-charcoal-700">{r.body}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        {form.role === "ngo" && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Organization name
            <input
              required
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
            />
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Address
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street, area, city"
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        <div className="flex items-center gap-3 rounded-xl bg-cream-200 px-4 py-3">
          <Button type="button" variant="outline" onClick={requestLocation} disabled={geoLoading} className="py-1.5 text-sm">
            {geoLoading ? "Locating…" : "Use my current location"}
          </Button>
          <span className="text-xs text-charcoal-700">
            {coords ? `Location set (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : "Used to match nearby donations"}
          </span>
        </div>
        {geoError && <p className="text-xs text-danger-500">{geoError}</p>}

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-700">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-terracotta-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
