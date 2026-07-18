import { motion } from "framer-motion";

export function FoodSavedIllustration({ className = "w-20 h-20" }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fsiPrimary" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
        <linearGradient id="fsiAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      <rect x="30" y="13" width="20" height="8" rx="3" fill="url(#fsiPrimary)" stroke="#10b981" strokeWidth="1.5" />
      <path
        d="M24 30 Q24 21 33 21 L47 21 Q56 21 56 30 L56 59 Q56 67 48 67 L32 67 Q24 67 24 59 Z"
        fill="url(#fsiPrimary)"
        stroke="#10b981"
        strokeWidth="1.5"
      />

      <circle cx="34" cy="42" r="2" fill="#065f46" />
      <circle cx="46" cy="42" r="2" fill="#065f46" />
      <path d="M34 49 Q40 55 46 49" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />

      <motion.g
        style={{ transformOrigin: "60px 21px" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="50" y="10" width="20" height="22" rx="4" fill="url(#fsiAccent)" stroke="#c2410c" strokeWidth="1.5" />
        <rect x="56" y="7" width="8" height="4" rx="2" fill="#c2410c" />
        <path d="M54 21 L58 25 L66 15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="54" y1="27" x2="64" y2="27" stroke="#fff" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
        <line x1="54" y1="30" x2="61" y2="30" stroke="#fff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
      </motion.g>

      <motion.circle
        cx="14"
        cy="60"
        r="3.5"
        fill="#34d399"
        opacity="0.4"
        animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <path
        d="M12 12 L13.3 8.6 L14.6 12 L18 13.3 L14.6 14.6 L13.3 18 L12 14.6 L8.6 13.3 Z"
        fill="#f97316"
        opacity="0.85"
      />
    </svg>
  );
}
