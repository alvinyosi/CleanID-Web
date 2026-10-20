export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const cardHover = {
  whileHover: { y: -6, scale: 1.01 },
  whileTap: { scale: 0.98 },
}

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const slideStep = {
  enter: (direction) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
}

export const menuVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.06, duration: 0.24 },
  }),
}
