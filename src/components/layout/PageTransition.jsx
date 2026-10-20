import { motion, usePresence, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { pageVariants } from '../../lib/motion'

export default function PageTransition({ children }) {
  const reduceMotion = useReducedMotion()
  const [isPresent, safeToRemove] = usePresence()
  const transitionRef = useRef(null)
  const variants = reduceMotion
    ? {
        initial: { opacity: 0 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.16 } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
      }
    : pageVariants

  return (
    <motion.div
      ref={transitionRef}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      onAnimationComplete={() => {
        if (!isPresent) {
          safeToRemove()
          return
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!transitionRef.current) return
            transitionRef.current.style.transform = 'none'
            transitionRef.current.style.filter = 'none'
          })
        })
      }}
      className="outline-none"
      tabIndex={-1}
    >
      {children}
    </motion.div>
  )
}
