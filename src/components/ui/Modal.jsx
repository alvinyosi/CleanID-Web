import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, usePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function ModalLayer({
  children,
  onClose,
  label,
  closeOnBackdrop,
  overlayClassName,
  panelClassName,
  drawer,
  initialFocusRef,
}) {
  const [isPresent, safeToRemove] = usePresence()
  const panelRef = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const previousPointerEvents = body.style.pointerEvents
    const previousFocus = document.activeElement
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const preferred = initialFocusRef?.current
      const initialTarget = preferred && panelRef.current?.contains(preferred)
        ? preferred
        : panelRef.current?.querySelector(focusableSelector)
      if (initialTarget instanceof HTMLElement) initialTarget.focus()
      else panelRef.current?.focus()
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current?.()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll(focusableSelector)]
      if (!focusable.length) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown, true)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      body.style.pointerEvents = previousPointerEvents
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [initialFocusRef])

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  }
  const panelVariants = drawer
    ? {
        initial: { x: '100%' },
        animate: { x: 0, transition: { type: 'spring', stiffness: 280, damping: 30 } },
        exit: { x: '100%', transition: { duration: 0.22 } },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.16 } },
      }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={overlayVariants}
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      onAnimationComplete={() => {
        if (!isPresent) safeToRemove()
      }}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.()
      }}
      className={`fixed inset-0 z-[100] flex h-[100dvh] min-h-0 w-screen overflow-y-auto overscroll-contain bg-ink/40 p-4 backdrop-blur-sm ${drawer ? 'items-stretch justify-end p-0' : 'items-center justify-center'} ${overlayClassName}`}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        variants={panelVariants}
        style={drawer ? {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(84vw, 360px)',
          maxWidth: 'min(84vw, 360px)',
          height: '100dvh',
          maxHeight: '100dvh',
          margin: 0,
          borderRadius: 0,
        } : undefined}
        className={`relative my-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white p-6 shadow-glass outline-none ${drawer ? 'max-w-none px-6 pb-8 pt-24' : ''} ${panelClassName}`}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function Modal({
  open,
  onClose,
  label = 'Dialog',
  children,
  closeOnBackdrop = true,
  overlayClassName = '',
  panelClassName = '',
  drawer = false,
  initialFocusRef,
  onExitComplete,
}) {
  const location = useLocation()
  const routeRef = useRef(location.pathname)
  const [routeDismissed, setRouteDismissed] = useState(false)

  useEffect(() => {
    if (routeRef.current === location.pathname) return
    routeRef.current = location.pathname
    setRouteDismissed(true)
  }, [location.pathname])

  useEffect(() => {
    if (!open) setRouteDismissed(false)
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && !routeDismissed && (
        <ModalLayer
          key={label}
          onClose={onClose}
          label={label}
          closeOnBackdrop={closeOnBackdrop}
          overlayClassName={overlayClassName}
          panelClassName={panelClassName}
          drawer={drawer}
          initialFocusRef={initialFocusRef}
        >
          {children}
        </ModalLayer>
      )}
    </AnimatePresence>,
    document.body,
  )
}
