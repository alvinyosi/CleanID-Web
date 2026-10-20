export default function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 2xl:max-w-[1440px] ${className}`}>
      {children}
    </div>
  )
}
