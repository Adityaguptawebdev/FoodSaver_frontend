import { AnimatePresence, motion } from "framer-motion";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            aria-hidden="true"
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-charcoal-900/10 bg-cream-50 p-6 shadow-[0_24px_48px_-16px_rgba(36,29,22,0.35)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-terracotta-500 via-gold-400 to-terracotta-500/40" />

            <h2 id="confirm-dialog-title" className="font-display text-xl font-semibold text-charcoal-900">
              {title}
            </h2>
            {body && <p className="mt-2 text-sm text-charcoal-700">{body}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
              <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
