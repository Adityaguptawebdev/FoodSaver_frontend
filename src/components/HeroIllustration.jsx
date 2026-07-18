import { motion } from "framer-motion";
import bannerImg from "../assets/illustrations/banner.png";
import foodCarryImg from "../assets/illustrations/food-carry.png";
import foodHandoverImg from "../assets/illustrations/food-handover.png";

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.4, y: 12 },
  show: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.45, duration: 0.5, ease: "backOut" },
  }),
};

const floatTransition = (delay) => ({
  y: [0, -6, 0],
  transition: { delay, duration: 3, repeat: Infinity, ease: "easeInOut" },
});

function JourneyNode({ index, image, label, size, ring, className }) {
  return (
    <motion.div
      className={`absolute flex flex-col items-center ${className}`}
      custom={index}
      variants={nodeVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        animate={floatTransition(1.4 + index * 0.3)}
        className={`flex items-center justify-center overflow-hidden rounded-full bg-cream-50 p-1.5 shadow-md ring-4 ${ring} ${size}`}
      >
        <img src={image} alt="" className="h-full w-full object-contain" />
      </motion.div>
      <span className="mt-2 rounded-full bg-cream-50 px-2.5 py-1 text-[11px] font-semibold text-charcoal-800 shadow-sm">
        {label}
      </span>
    </motion.div>
  );
}

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80 md:h-96 md:w-96">
      <div className="pointer-events-none absolute inset-0 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] bg-terracotta-500/10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-8 rounded-[60%_40%_40%_60%/60%_60%_40%_40%] bg-olive-500/10" aria-hidden="true" />

      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <motion.path
          d="M78 70 C 40 140, 60 190, 130 200 S 260 220, 240 260"
          fill="none"
          stroke="var(--color-terracotta-300)"
          strokeWidth="3"
          strokeDasharray="2 12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 1.4, ease: "easeInOut" }}
        />
      </svg>

      <JourneyNode
        index={0}
        image={bannerImg}
        label="Posted"
        size="h-24 w-24 sm:h-28 sm:w-28"
        ring="ring-terracotta-100"
        className="left-2 top-6 sm:left-4 sm:top-8"
      />

      <JourneyNode
        index={1}
        image={foodCarryImg}
        label="On the way"
        size="h-16 w-16 sm:h-20 sm:w-20"
        ring="ring-gold-300/50"
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <JourneyNode
        index={2}
        image={foodHandoverImg}
        label="Delivered"
        size="h-24 w-24 sm:h-28 sm:w-28"
        ring="ring-olive-100"
        className="bottom-4 right-2 sm:bottom-6 sm:right-4"
      />

      <motion.span
        className="absolute right-10 top-4 text-lg text-terracotta-300 sm:right-14 sm:top-6"
        aria-hidden="true"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
        transition={{ delay: 1.8, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.span>
      <motion.span
        className="absolute bottom-16 left-0 text-sm text-olive-300 sm:right-14 sm:top-6"
        aria-hidden="true"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
        transition={{ delay: 2.3, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.span>
    </div>
  );
}
