import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Toast({ message }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, x: 24, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 28 } }}
          exit={{ opacity: 0, x: 14, transition: { duration: 0.18 } }}
          className="fixed right-4 top-20 z-[110] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-ink shadow-glass"
        >
          <BadgeCheck size={18} className="shrink-0 text-primary" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
