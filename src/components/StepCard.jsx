import { useState } from "react";
import { motion } from "framer-motion";

export default function StepCard({ image, title, body, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-1 rounded-2xl border border-charcoal-900/10 bg-cream-50 p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, boxShadow: "0 16px 32px -12px rgba(36,29,22,0.18)" }}
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-terracotta-500 to-transparent opacity-60" />

      <motion.span
        className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-sm font-bold text-cream-50"
        animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {index + 1}
      </motion.span>

      <div className="flex items-center gap-4">
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: index * 0.12 + 0.15, duration: 0.55, ease: "backOut" }}
        >
          <motion.div
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img src={image} alt="" className="h-16 w-16 object-contain" />
          </motion.div>
        </motion.div>

        <h3 className="font-display text-xl font-semibold text-charcoal-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-charcoal-700">{body}</p>
    </motion.div>
  );
}
