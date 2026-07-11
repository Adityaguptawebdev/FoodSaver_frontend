import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";

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
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-charcoal-700">Log in to post or claim food donations.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
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
  );
}
