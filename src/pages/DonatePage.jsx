import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import LocationPicker from "../components/LocationPicker.jsx";
import Button from "../components/Button.jsx";

const emptyForm = {
  title: "",
  description: "",
  foodType: "veg",
  quantity: "",
  unit: "servings",
  safeUntil: "",
  pickupAddress: "",
};

export default function DonatePage() {
  const [coords, setCoords] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!coords) {
      setError("Set your pickup location before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      data.append("lng", coords.lng);
      data.append("lat", coords.lat);
      if (photo) data.append("photo", photo);

      const res = await client.post("/donations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreated(res.data.donation);
      setForm(emptyForm);
      setCoords(null);
      setPhoto(null);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post this donation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-olive-300 bg-olive-100 p-6">
          <h1 className="font-display text-2xl font-semibold text-olive-700">Donation posted 🎉</h1>
          <p className="mt-2 text-sm text-charcoal-700">
            Nearby NGOs and volunteers can now see and claim "{created.title}".
          </p>

          {(created.ai?.category || created.ai?.generatedDescription) && (
            <div className="mt-4 rounded-xl bg-cream-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">✨ AI listing assist</p>
              {created.ai.generatedDescription && (
                <p className="mt-1 text-sm text-charcoal-800">{created.ai.generatedDescription}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {created.ai.category && (
                  <span className="rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-medium text-terracotta-700">
                    {created.ai.category}
                  </span>
                )}
                {created.ai.allergens?.map((a) => (
                  <span key={a} className="rounded-full bg-gold-300/40 px-2 py-0.5 text-xs font-medium text-gold-600">
                    {a}
                  </span>
                ))}
              </div>
              {created.ai.shelfLifeNote && (
                <p className="mt-2 text-xs text-charcoal-700">🛡️ {created.ai.shelfLifeNote}</p>
              )}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button variant="primary" onClick={() => setCreated(null)}>Post another</Button>
            <Button as={Link} to="/my-donations" variant="outline">View my donations</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Post surplus food</h1>
      <p className="mt-2 text-charcoal-700">
        Add a photo and we'll auto-suggest a category, allergens, and a safe-to-eat estimate.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Title
          <input
            required
            placeholder="e.g. Veg biryani, 20 boxes"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Description (optional — AI will polish this up)
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Food type
            <select
              value={form.foodType}
              onChange={(e) => update("foodType", e.target.value)}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-3 py-2.5 outline-none focus:border-terracotta-500"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
              <option value="vegan">Vegan</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Quantity
            <input
              type="number"
              min={1}
              required
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-3 py-2.5 outline-none focus:border-terracotta-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
            Unit
            <select
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-3 py-2.5 outline-none focus:border-terracotta-500"
            >
              <option value="servings">Servings</option>
              <option value="kg">Kg</option>
              <option value="packets">Packets</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Safe to eat until
          <input
            type="datetime-local"
            required
            value={form.safeUntil}
            onChange={(e) => update("safeUntil", e.target.value)}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none focus:border-terracotta-500"
          />
        </label>

        <LocationPicker
          required
          address={form.pickupAddress}
          onAddressChange={(value) => update("pickupAddress", value)}
          coords={coords}
          onCoordsChange={setCoords}
        />

        <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
          Photo (optional, powers the AI listing assist)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-terracotta-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cream-50"
          />
        </label>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Posting…" : "Post donation"}
        </Button>
      </form>
    </div>
  );
}
