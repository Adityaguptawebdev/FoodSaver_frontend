import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import Button from "../components/Button.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

const inputClasses =
  "rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500";

const ROLES = [
  { value: "donor", label: "Donor", body: "Restaurant, event, or household with surplus food" },
  { value: "ngo", label: "NGO", body: "Registered organization distributing food to those in need" },
  { value: "volunteer", label: "Volunteer", body: "Individual who can pick up and deliver donations" },
];

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [coords, setCoords] = useState(null);
  // Set when a first-time Google user is finishing sign-up: { idToken, profile }
  const [google, setGoogle] = useState(location.state?.google ?? null);

  const [form, setForm] = useState({
    role: "donor",
    name: location.state?.google?.profile?.name ?? "",
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
      if (google) {
        const { name, role, phone, orgName, address } = form;
        await loginWithGoogle(google.idToken, {
          name,
          role,
          phone,
          orgName,
          address,
          lng: coords?.lng,
          lat: coords?.lat,
        });
      } else {
        await register({
          ...form,
          lng: coords?.lng,
          lat: coords?.lat,
        });
      }
      navigate("/");
    } catch (err) {
      if (google && err.response?.status === 401) {
        // Google ID tokens expire after an hour
        setGoogle(null);
        setError("Your Google sign-in expired. Continue with Google again.");
      } else if (err.response) {
        setError(err.response.data?.message || "Couldn't create your account.");
      } else {
        setError("Can't reach the server right now — check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken) {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (result.needsRole) {
        setGoogle({ idToken, profile: result.profile });
        setForm((prev) => ({ ...prev, name: prev.name || result.profile.name || "" }));
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Couldn't sign in with Google.");
      } else {
        setError("Can't reach the server right now — check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="texture-grain min-h-[calc(100vh-73px)] bg-cream-100 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 shadow-sm sm:p-10">
        <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">
          {google ? "Finish creating your account" : "Create your account"}
        </h1>
        <p className="mt-2 text-charcoal-700">
          {google ? (
            <>
              Signed in with Google as <span className="font-semibold">{google.profile.email}</span>. Tell us who
              you are so we can route donations correctly.
            </>
          ) : (
            "Tell us who you are so we can route donations correctly."
          )}
        </p>

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
              className={inputClasses}
            />
          </label>

          {form.role === "ngo" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
              Organization name
              <input
                required
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className={inputClasses}
              />
            </label>
          )}

          <div className={`grid gap-4 ${google ? "" : "sm:grid-cols-2"}`}>
            {!google && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClasses}
                />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClasses}
              />
            </label>
          </div>

          {!google && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
              Password
              <PasswordInput
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClasses}
              />
            </label>
          )}

          <LocationPicker
            address={form.address}
            onAddressChange={(value) => setForm({ ...form, address: value })}
            coords={coords}
            onCoordsChange={setCoords}
          />

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="mt-6">
          {google ? (
            <button
              type="button"
              onClick={() => setGoogle(null)}
              className="w-full text-center text-sm font-semibold text-terracotta-600"
            >
              Sign up with email and password instead
            </button>
          ) : (
            <GoogleSignInButton
              onCredential={handleGoogle}
              onError={() => setError("Google sign-in didn't complete. Please try again.")}
            />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-charcoal-700">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-terracotta-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
