import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import client from "../api/client.js";
import { resolveImageUrl } from "../utils/imageUrl.js";
import LocationPicker from "../components/LocationPicker.jsx";
import DateTimeField from "../components/DateTimeField.jsx";
import Button from "../components/Button.jsx";
import Spinner from "../components/Spinner.jsx";
import bannerImg from "../assets/illustrations/banner.png";

const emptyForm = {
  title: "",
  description: "",
  foodType: "veg",
  quantity: "",
  unit: "servings",
  safeUntil: "",
  pickupAddress: "",
};

const inputClasses =
  "rounded-xl border border-charcoal-900/15 bg-cream-50 px-4 py-2.5 outline-none transition-colors focus:border-terracotta-500";

const TIPS = [
  "Add a clear photo — it powers our AI tagging for category, allergens, and a safe-to-eat note.",
  "Be realistic with the safe-to-eat window so NGOs can plan pickup with confidence.",
  "A precise pickup pin gets your listing seen by volunteers nearby first.",
];

const SAFE_UNTIL_STEP_MS = 15 * 60 * 1000; // matches the date picker's 15-minute steps

// A repost keeps the same safe-to-eat window length as last time, counted from now.
function nextSafeUntil(donation) {
  const windowMs = new Date(donation.safeUntil) - new Date(donation.createdAt);
  if (!(windowMs > 0)) return "";
  return new Date(Math.ceil((Date.now() + windowMs) / SAFE_UNTIL_STEP_MS) * SAFE_UNTIL_STEP_MS).toISOString();
}

function formFromDonation(donation) {
  return {
    title: donation.title,
    description: donation.description || "",
    foodType: donation.foodType,
    quantity: String(donation.quantity),
    unit: donation.unit,
    safeUntil: nextSafeUntil(donation),
    pickupAddress: donation.pickupAddress,
  };
}

export default function DonatePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const repostId = searchParams.get("repost");
  const [coords, setCoords] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPreview, setAiPreview] = useState(null);
  const [repostSource, setRepostSource] = useState(null); // { id, title, photoUrl } of the donation being posted again
  const [repostError, setRepostError] = useState("");

  // "Post again" from My donations lands here with ?repost=<id>: prefill everything from that donation.
  useEffect(() => {
    setRepostSource(null);
    setRepostError("");
    if (!repostId) {
      // Leaving a prefilled repost (e.g. via the navbar's "Post donation") starts a blank form.
      setForm(emptyForm);
      setCoords(null);
      return;
    }

    let ignore = false;
    client
      .get(`/donations/${repostId}`)
      .then((res) => {
        if (ignore) return;
        const d = res.data.donation;
        const [lng, lat] = d.location.coordinates;
        setForm(formFromDonation(d));
        setCoords({ lng, lat });
        setPhoto(null);
        setAiPreview(null);
        setRepostSource({ id: d._id, title: d.title, photoUrl: d.photoUrl || null });
      })
      .catch(() => {
        if (!ignore) setRepostError("Couldn't load that donation to post again — fill in the details below instead.");
      });
    return () => {
      ignore = true;
    };
  }, [repostId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAiEnhance() {
    if (!form.title.trim()) {
      setAiError("Add a title first so AI has something to work with.");
      return;
    }
    setAiError("");
    setAiLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("foodType", form.foodType);
      data.append("quantity", form.quantity);
      data.append("unit", form.unit);
      if (photo) data.append("photo", photo);

      const res = await client.post("/donations/ai-preview", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAiPreview(res.data.ai);
      if (res.data.ai.generatedDescription) {
        update("description", res.data.ai.generatedDescription);
      }
    } catch (err) {
      setAiError(err.response?.data?.message || "Couldn't reach the AI assistant.");
    } finally {
      setAiLoading(false);
    }
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
      else if (repostSource?.photoUrl) data.append("repostOf", repostSource.id);

      const res = await client.post("/donations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreated(res.data.donation);
      setForm(emptyForm);
      setCoords(null);
      setPhoto(null);
      setAiPreview(null);
      // Drop ?repost so "Post another" starts from a blank form.
      if (repostId) setSearchParams({}, { replace: true });
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
    <div className="flex h-[calc(100vh-73px)] overflow-hidden">
      <div className="relative hidden shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-terracotta-100 via-cream-100 to-olive-100/50 px-10 lg:flex lg:w-[38%]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-terracotta-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-olive-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/10 blur-3xl" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cream-50/60 bg-cream-50/90 p-8 text-center shadow-[0_24px_48px_-16px_rgba(36,29,22,0.25)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_28px_56px_-14px_rgba(36,29,22,0.3)]"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-terracotta-500 via-gold-400 to-terracotta-500/40" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-terracotta-500/15" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-olive-500/15" aria-hidden="true" />

          <motion.img
            src={bannerImg}
            alt=""
            className="mx-auto h-36 w-auto drop-shadow-md"
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "backOut" }}
          />

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-terracotta-600">✨ Quick tips</p>
          <h2 className="mt-1.5 font-display text-xl font-semibold text-charcoal-900">Tips for a great listing</h2>

          <ul className="mt-5 flex flex-col gap-4 border-t border-charcoal-900/10 pt-5 text-left text-sm text-charcoal-700">
            {TIPS.map((tip, i) => (
              <motion.li
                key={tip}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.1, ease: "easeOut" }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta-500 text-xs font-bold text-cream-50 shadow-sm">
                  ✓
                </span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-10 sm:px-6 sm:py-16">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 shadow-sm sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-terracotta-500 to-transparent opacity-60" />

          <h1 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">Post surplus food</h1>
          <p className="mt-2 text-charcoal-700">
            Add a photo and we'll auto-suggest a category, allergens, and a safe-to-eat estimate.
          </p>

          {repostSource && (
            <p className="mt-5 rounded-xl bg-olive-100 px-4 py-3 text-sm text-olive-700">
              🔁 Prefilled from <strong>"{repostSource.title}"</strong>. Check the quantity and safe-to-eat time, then post.
            </p>
          )}
          {repostError && (
            <p className="mt-5 rounded-xl bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{repostError}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">What's on offer</p>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Title
                <input
                  required
                  placeholder="e.g. Veg biryani, 20 boxes"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="donation-description" className="text-sm font-medium text-charcoal-800">
                    Description (optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAiEnhance}
                    disabled={aiLoading || !form.title.trim()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-terracotta-300 bg-terracotta-100/50 px-3 py-1 text-xs font-semibold text-terracotta-700 transition-colors hover:bg-terracotta-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {aiLoading ? (
                      <>
                        <Spinner size={12} />
                        Enhancing…
                      </>
                    ) : (
                      <>✨ Enhance with AI</>
                    )}
                  </button>
                </div>
                <textarea
                  id="donation-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Add a title, then let AI write this for you — or write your own."
                  className={inputClasses}
                />
                {aiError && <p className="text-xs text-danger-500">{aiError}</p>}
                {aiPreview && !aiLoading && (
                  <div className="flex flex-col gap-1.5 rounded-xl bg-terracotta-100/40 px-3 py-2.5">
                    <p className="text-xs font-semibold text-terracotta-700">✨ AI applied — feel free to edit above</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiPreview.category && (
                        <span className="rounded-full bg-cream-50 px-2 py-0.5 text-xs font-medium text-terracotta-700">
                          {aiPreview.category}
                        </span>
                      )}
                      {aiPreview.estimatedServings && (
                        <span className="rounded-full bg-cream-50 px-2 py-0.5 text-xs font-medium text-terracotta-700">
                          ~{aiPreview.estimatedServings} servings
                        </span>
                      )}
                      {aiPreview.allergens?.map((a) => (
                        <span key={a} className="rounded-full bg-gold-300/40 px-2 py-0.5 text-xs font-medium text-gold-600">
                          {a}
                        </span>
                      ))}
                    </div>
                    {aiPreview.shelfLifeNote && (
                      <p className="text-xs text-charcoal-700">🛡️ {aiPreview.shelfLifeNote}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-charcoal-900/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">Quantity &amp; safety</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                  Food type
                  <select
                    value={form.foodType}
                    onChange={(e) => update("foodType", e.target.value)}
                    className={`${inputClasses} px-3`}
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
                    className={`${inputClasses} px-3`}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                  Unit
                  <select
                    value={form.unit}
                    onChange={(e) => update("unit", e.target.value)}
                    className={`${inputClasses} px-3`}
                  >
                    <option value="servings">Servings</option>
                    <option value="kg">Kg</option>
                    <option value="packets">Packets</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Safe to eat until
                <DateTimeField
                  required
                  value={form.safeUntil}
                  onChange={(value) => update("safeUntil", value)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-4 border-t border-charcoal-900/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">Pickup</p>
              <LocationPicker
                required
                address={form.pickupAddress}
                onAddressChange={(value) => update("pickupAddress", value)}
                coords={coords}
                onCoordsChange={setCoords}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-charcoal-900/10 pt-6">
              {repostSource?.photoUrl && !photo && (
                <div className="flex items-center gap-3 rounded-xl bg-cream-200 p-2 pr-4">
                  <img
                    src={resolveImageUrl(repostSource.photoUrl)}
                    alt="Photo from last time"
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <p className="flex-1 text-xs text-charcoal-700">
                    Reusing the photo from last time. Choose a new one below to replace it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRepostSource((s) => ({ ...s, photoUrl: null }))}
                    className="text-xs font-semibold text-terracotta-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <label className="flex flex-col gap-1.5 text-sm font-medium text-charcoal-800">
                Photo (optional, powers the AI listing assist)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className={`${inputClasses} file:mr-3 file:rounded-full file:border-0 file:bg-terracotta-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cream-50`}
                />
              </label>
            </div>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? "Posting…" : "Post donation"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
