import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-28 w-28',
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 44,
}

export default function Avatar({ src, name = 'Pengguna', size = 'md', className = '' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasImage = Boolean(src) && !imageFailed

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const sharedClassName = `${sizeClasses[size] || sizeClasses.md} shrink-0 rounded-full ${className}`

  if (hasImage) {
    return (
      <img
        src={src}
        alt={`Foto profil ${name}`}
        onError={() => setImageFailed(true)}
        className={`${sharedClassName} object-cover`}
      />
    )
  }

  return (
    <span className={`${sharedClassName} inline-flex items-center justify-center bg-[#EAF2FF] text-primary`} aria-label={`Profil ${name}`}>
      <User size={iconSizes[size] || iconSizes.md} strokeWidth={1.8} aria-hidden="true" />
    </span>
  )
}
