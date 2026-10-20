import { useCallback, useEffect, useRef, useState } from 'react'

export default function useToast() {
  const [message, setMessage] = useState('')
  const timeout = useRef()

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const showToast = useCallback((nextMessage) => {
    window.clearTimeout(timeout.current)
    setMessage(nextMessage)
    timeout.current = window.setTimeout(() => setMessage(''), 2800)
  }, [])

  return [message, showToast]
}
