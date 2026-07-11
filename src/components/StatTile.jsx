import { motion } from "framer-motion";

export default function StatTile({ label, value, dark = false, icon, delay = 0 }) {
  return (
    <div
      className={`rounded-2xl border px-6 py-5 text-center transition-transform hover:-translate-y-0.5 ${
        dark ? "border-cream-50/15 bg-cream-50/10 backdrop-blur-sm" : "border-charcoal-900/10 bg-cream-50"
      }`}
    >
      {icon && (
        <motion.div
          className="mb-1 text-2xl"
          initial={{ opacity: 0, scale: 0.3, y: 8 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay, duration: 0.45, ease: "backOut" }}
        >
          {icon}
        </motion.div>
      )}
      <div className={`font-sans text-3xl font-semibold ${dark ? "text-cream-50" : "text-terracotta-600"}`}>
        {value}
      </div>
      <div className={`mt-1 text-sm ${dark ? "text-cream-100" : "text-charcoal-700"}`}>{label}</div>
    </div>
  );
}
