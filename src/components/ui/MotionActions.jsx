import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LoaderCircle } from 'lucide-react'

export function MotionLink({ to, children, className = '', navigateDelay = 150, onClick, ...props }) {
  const navigate = useNavigate()
  const [ripples, setRipples] = useState([])

  const handleClick = (event) => {
    if (onClick) onClick(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const ripple = {
      id: Date.now(),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
    setRipples((current) => [...current, ripple])
    window.setTimeout(() => navigate(to), navigateDelay)
  }

  return (
    <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className={`relative inline-flex overflow-hidden rounded-full ${className}`}>
      <Link to={to} onClick={handleClick} className="relative z-[1] inline-flex items-center gap-2" {...props}>
        {children}
      </Link>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ opacity: 0.35, scale: 0 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => setRipples((current) => current.filter((item) => item.id !== ripple.id))}
          className="pointer-events-none absolute z-0 h-8 w-8 rounded-full bg-white"
          style={{ left: ripple.x - 16, top: ripple.y - 16 }}
        />
      ))}
    </motion.span>
  )
}

export function MotionButton({
  children,
  onClick,
  className = '',
  loadingLabel = 'Memproses...',
  isLoading = false,
  delay = 600,
  arrow = false,
  disabled = false,
  ...props
}) {
  const [waiting, setWaiting] = useState(false)
  const [ripples, setRipples] = useState([])
  const busy = isLoading || waiting

  const handleClick = async (event) => {
    if (busy) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const ripple = {
      id: Date.now(),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
    setRipples((current) => [...current, ripple])
    if (!onClick) return
    setWaiting(true)
    const startedAt = Date.now()
    try {
      await onClick(event)
      const remaining = Math.max(0, delay - (Date.now() - startedAt))
      if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining))
    } finally {
      setWaiting(false)
    }
  }

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(74,143,240,.24)' }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      {...props}
      disabled={busy || disabled}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-75 ${className}`}
    >
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">
        {busy && <LoaderCircle size={16} className="animate-spin" />}
        {busy ? loadingLabel : children}
        {!busy && arrow && <motion.span whileHover={{ x: 3 }}><ArrowRight size={16} /></motion.span>}
      </span>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ opacity: 0.35, scale: 0 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => setRipples((current) => current.filter((item) => item.id !== ripple.id))}
          className="pointer-events-none absolute z-0 h-8 w-8 rounded-full bg-white"
          style={{ left: ripple.x - 16, top: ripple.y - 16 }}
        />
      ))}
    </motion.button>
  )
}
