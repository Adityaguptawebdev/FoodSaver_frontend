import { motion } from "framer-motion";

export default function StatTile({ label, value, dark = false, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border px-3 pb-4 pt-4 sm:px-5 ${
        dark ? "border-cream-50/15 bg-cream-50/10 backdrop-blur-sm" : "border-charcoal-900/10 bg-cream-50"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
          dark ? "from-terracotta-400 to-transparent opacity-70" : "from-terracotta-500 to-transparent opacity-60"
        }`}
      />

      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
        <div className="min-w-0">
          <p className={`text-[10.5px] font-semibold uppercase leading-tight tracking-wide sm:text-xs ${dark ? "text-gold-300/90" : "text-terracotta-600"}`}>
            {label}
          </p>
          <p className={`mt-1 font-sans text-2xl font-semibold sm:text-3xl ${dark ? "text-cream-50" : "text-charcoal-900"}`}>{value}</p>
        </div>
        {icon && (
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: delay + 0.15, duration: 0.5, ease: "backOut" }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
