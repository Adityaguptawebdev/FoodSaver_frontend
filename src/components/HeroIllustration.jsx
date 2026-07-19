import { motion } from "framer-motion";
import foodHandoverImg from "../assets/illustrations/food-handover.png";

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96 md:h-[26rem] md:w-[26rem]">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
      >
        <motion.img
          src={foodHandoverImg}
          alt="A donor handing a box of surplus food to an NGO volunteer"
          className="h-80 w-80 object-contain drop-shadow-xl sm:h-96 sm:w-96 md:h-[26rem] md:w-[26rem]"
          animate={{ y: [0, -8, 0] }}
          transition={{ delay: 1, duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.span
          className="absolute right-0 top-4 rounded-full bg-cream-50 px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-sm sm:top-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          Handed over, hand to hand
        </motion.span>

        <motion.span
          className="absolute right-4 top-0 text-lg text-terracotta-300 sm:right-8"
          aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
          transition={{ delay: 1.8, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
        <motion.span
          className="absolute bottom-8 left-0 text-sm text-olive-300"
          aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
          transition={{ delay: 2.3, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      </motion.div>
    </div>
  );
}
