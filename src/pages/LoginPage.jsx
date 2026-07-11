import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const inputClasses =
  "rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Couldn't log in. Check your credentials.");
      } else {
        setError("Can't reach the server right now — check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <div className="texture-grain relative hidden w-1/2 shrink-0 overflow-hidden bg-olive-700 md:flex md:flex-col md:items-center md:justify-center md:px-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cream-50/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-cream-50/5" aria-hidden="true" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-cream-50/10 text-6xl">
          🥘
        </div>
        <h2 className="relative mt-8 max-w-sm text-center font-display text-3xl font-semibold text-cream-50">
          Good food finds a good home.
        </h2>
        <p className="relative mt-3 max-w-sm text-center text-cream-100">
          Sign in to post surplus food, claim nearby donations, and track your impact.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-charcoal-700">Log in to post or claim food donations.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
            <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
              Password
              <PasswordInput
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClasses}
              />
            </label>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-700">
            New here?{" "}
            <Link to="/register" className="font-semibold text-terracotta-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
