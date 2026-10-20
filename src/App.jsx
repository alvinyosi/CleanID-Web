import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useOutlet, useParams } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  CreditCard,
  FileText,
  Home,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { services, categories } from './data/services'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BookingProvider, useBooking } from './context/BookingContext'
import { cardHover, fadeUp, staggerContainer } from './lib/motion'
import PageTransition from './components/layout/PageTransition'
import Container from './components/layout/Container'
import { MotionButton, MotionLink } from './components/ui/MotionActions'
import Avatar from './components/ui/Avatar'
import Toast from './components/ui/Toast'
import useToast from './lib/useToast'
import usePageTitle, { DEFAULT_PAGE_TITLE } from './lib/usePageTitle'
import Modal from './components/ui/Modal'
import { createPortal } from 'react-dom'

const defaultAddresses = [
  {
    id: 'home-1',
    label: 'Rumah',
    recipient: 'Rizky Hidayat',
    phone: '081234567890',
    address: 'Jl. Mawar No. 12, RT 03 RW 02',
    city: 'Bandung',
    postal: '40123',
    note: 'Depan pos satpam',
    primary: true,
  },
]

const paymentMethods = ['Transfer Bank', 'E-Wallet', 'QRIS', 'Bayar di Tempat']

const statusList = ['Menunggu Pembayaran', 'Dikonfirmasi', 'Petugas Ditugaskan', 'Dalam Pengerjaan', 'Selesai']

function readAddresses() {
  try {
    const data = JSON.parse(localStorage.getItem('cleanid-addresses') ?? 'null')
    return data && data.length ? data : defaultAddresses
  } catch {
    return defaultAddresses
  }
}

function saveAddresses(addresses) {
  localStorage.setItem('cleanid-addresses', JSON.stringify(addresses))
}

const defaultUser = {
  fullName: '',
  email: '',
  phone: '',
  avatar: null,
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MotionConfig reducedMotion="user">
            <AppRoutes />
          </MotionConfig>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="layanan" element={<ServicesPage />} />
        <Route path="layanan/:id" element={<ServiceDetailPage />} />
        <Route path="masuk" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="daftar" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="pesan/:serviceId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="pesanan" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="pesanan/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="alamat" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

function AnimatedOutlet() {
  const outlet = useOutlet()
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return undefined
    const timeout = window.setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    }, 520)
    return () => window.clearTimeout(timeout)
  }, [location.hash, location.pathname])

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        window.scrollTo(0, 0)
        document.querySelector('main')?.focus({ preventScroll: true })
      }}
    >
      {outlet && (
        <PageTransition key={location.pathname}>
          {outlet}
        </PageTransition>
      )}
    </AnimatePresence>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/masuk" replace />
}

function BucketLogo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
      <path d="M8 11h16l-1.6 13.2a2 2 0 0 1-2 1.8h-8.8a2 2 0 0 1-2-1.8L8 11Z" fill="currentColor" />
      <path d="M6.5 10.5h19v3h-19zM11 10c.7-4 2.4-6 5-6s4.3 2 5 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
    </svg>
  )
}

function ProfileDropdown({ open, user, isAuthenticated, position, panelRef, onClose, onLogout }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-dropdown"
          ref={panelRef}
          role="menu"
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          style={{ transformOrigin: 'top right', position: 'fixed', top: position.top, right: position.right }}
          className="z-[110] w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft"
        >
          {isAuthenticated ? (
            <>
              <div className="mb-1 flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
                <span className="truncate text-xs font-semibold text-ink">{user?.fullName}</span>
              </div>
              <Link role="menuitem" to="/profil" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><UserRound size={16} /> Profil</Link>
              <Link role="menuitem" to="/pesanan" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><PackageCheck size={16} /> Pesanan</Link>
              <Link role="menuitem" to="/alamat" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><MapPin size={16} /> Alamat</Link>
              <button role="menuitem" onClick={() => { onClose(); onLogout() }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"><LogOut size={16} /> Keluar</button>
            </>
          ) : (
            <>
              <Link role="menuitem" to="/masuk" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Masuk</Link>
              <Link role="menuitem" to="/daftar" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Daftar</Link>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function MainLayout() {
  const { isAuthenticated, loading, logout, user } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 64, right: 24 })
  const userMenuButton = useRef(null)
  const mobileUserMenuButton = useRef(null)
  const userMenuPanel = useRef(null)
  const location = useLocation()

  const toggleUserMenu = (button) => {
    const bounds = button?.getBoundingClientRect()
    if (bounds) setUserMenuPosition({ top: bounds.bottom + 8, right: Math.max(12, window.innerWidth - bounds.right) })
    setUserMenu((previous) => !previous)
  }

  useEffect(() => {
    setOpenMenu(false)
    setUserMenu(false)
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.body.style.pointerEvents = ''
  }, [location.pathname])

  useEffect(() => {
    if (!userMenu) return undefined
    const handlePointerDown = (event) => {
      if (userMenuButton.current?.contains(event.target)
        || mobileUserMenuButton.current?.contains(event.target)
        || userMenuPanel.current?.contains(event.target)) return
      setUserMenu(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenu(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenu])

  return (
    <div className="min-h-screen w-full bg-panel">
      <header className="sticky top-0 z-40 w-full border-b border-white/70 bg-white/80 shadow-[0_4px_18px_rgba(56,104,173,0.05)] backdrop-blur-xl">
          <Container className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-primary shadow-sm">
                <BucketLogo />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-ink">CleanID</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/#tentang' },
                { label: 'Services', to: '/layanan' },
                { label: 'Testimonial', to: '/#testimoni' },
                { label: 'Blog', to: '/#blog' },
              ].map(({ label, to }) => {
                const isActive = to === '/' ? location.pathname === '/' && !location.hash : to === '/layanan' ? location.pathname.startsWith('/layanan') : location.hash === to.split('#')[1]
                const hash = to.includes('#') ? to.split('#')[1] : ''
                return (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => {
                      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={`relative py-2 text-[11px] font-bold transition-colors hover:-translate-y-0.5 hover:text-primary ${isActive ? 'text-primary' : 'text-slate-600'}`}
                  >
                    {label}
                    {isActive && <motion.span layoutId="navbar-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {!loading && (
                <div className="relative">
                  <button
                    ref={userMenuButton}
                    aria-label={isAuthenticated ? `Menu profil ${user?.fullName || ''}` : 'Buka menu akun'}
                    aria-expanded={userMenu}
                    aria-haspopup="menu"
                    className={`flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm ${isAuthenticated ? 'pl-1.5 pr-3' : ''}`}
                    onClick={() => toggleUserMenu(userMenuButton.current)}
                  >
                    <Avatar src={user?.avatar} name={user?.fullName || 'Pengguna'} size="md" />
                    {isAuthenticated && <span className="text-sm font-semibold text-ink">{user?.fullName}</span>}
                  </button>
                </div>
              )}
              <ProfileDropdown
                open={userMenu}
                user={user}
                isAuthenticated={isAuthenticated}
                position={userMenuPosition}
                panelRef={userMenuPanel}
                onClose={() => setUserMenu(false)}
                onLogout={logout}
              />
              <motion.a href="tel:+6281044216305" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm"><Phone size={14} /> Hubungi Kami</motion.a>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                ref={mobileUserMenuButton}
                aria-label={isAuthenticated ? 'Buka menu profil' : 'Buka menu akun'}
                aria-expanded={userMenu}
                aria-haspopup="menu"
                className="rounded-full border border-slate-200 bg-white p-1.5 shadow-sm"
                onClick={() => toggleUserMenu(mobileUserMenuButton.current)}
              >
                <Avatar src={user?.avatar} name={user?.fullName || 'Pengguna'} size="sm" />
              </button>
              <button aria-label={openMenu ? 'Tutup menu' : 'Buka menu'} className="rounded-full bg-white p-2 text-ink shadow-sm" onClick={() => setOpenMenu((p) => !p)}>
                {openMenu ? <X /> : <Menu />}
              </button>
            </div>
          </Container>

          <Modal open={openMenu} onClose={() => setOpenMenu(false)} label="Navigasi utama" drawer overlayClassName="!p-0 bg-ink/25" panelClassName="z-10 flex flex-col gap-3 shadow-2xl">
                  <button aria-label="Tutup menu" onClick={() => setOpenMenu(false)} className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-ink"><X size={18} /></button>
                  <div className="mb-2 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Avatar src={user?.avatar} name={user?.fullName || 'Pengguna'} size="md" />
                    <div className="text-sm font-bold text-ink">{isAuthenticated ? user?.fullName : 'Akun CleanID'}<div className="text-xs font-medium text-secondary">{isAuthenticated ? user?.email : 'Masuk atau buat akun'}</div></div>
                  </div>
                  {[
                    ['Beranda', '/'],
                    ['Layanan', '/layanan'],
                    ['Testimoni', '/#testimoni'],
                    ['Blog & Tips', '/#blog'],
                    ...(isAuthenticated ? [['Pesanan', '/pesanan'], ['Profil', '/profil']] : [['Masuk', '/masuk'], ['Daftar', '/daftar']]),
                  ].map(([label, to], index) => (
                    <motion.div key={label} custom={index} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.06 } }}>
                      <Link to={to} onClick={() => setOpenMenu(false)} className="block rounded-xl px-4 py-3 text-base font-semibold text-ink hover:bg-primarySoft hover:text-primary">{label}</Link>
                    </motion.div>
                  ))}
                  <motion.a href="tel:+6281044216305" whileTap={{ scale: 0.97 }} onClick={() => setOpenMenu(false)} className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white"><Phone size={15} /> Hubungi Kami</motion.a>
                  {isAuthenticated && <button onClick={() => { logout(); setOpenMenu(false) }} className="rounded-full bg-red-50 px-4 py-3 text-left font-semibold text-red-600">Keluar</button>}
          </Modal>
      </header>

      <main id="main-content" tabIndex={-1} className="w-full outline-none">
          <LayoutGroup id="cleanid-shared">
            <AnimatedOutlet />
          </LayoutGroup>
      </main>

      <footer className="w-full border-t border-blue-100 bg-[#eef5ff] py-14">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-primary"><BucketLogo /></div>
                <div className="text-xl font-extrabold tracking-tight text-ink">CleanID</div>
              </div>
              <p className="max-w-xs text-sm leading-7 text-slate-600">Layanan kebersihan profesional untuk rumah dan kantor. Hadirkan ruang yang lebih segar setiap hari.</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-extrabold text-ink">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-primary">Beranda</Link></li>
                <li><Link to="/layanan" className="hover:text-primary">Layanan</Link></li>
                <li><Link to="/pesanan" className="hover:text-primary">Pesanan Saya</Link></li>
                <li><Link to="/profil" className="hover:text-primary">Profil</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-extrabold text-ink">Layanan</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {services.slice(0, 4).map((service) => <li key={service.id}><Link to={`/layanan/${service.id}`} className="hover:text-primary">{service.name}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-extrabold text-ink">Kontak Kami</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>hello@cleanid.id</li>
                <li>+62 812 3456 7890</li>
                <li>Bandung, Indonesia</li>
                <li className="pt-2"><a href="tel:+6281234567890" className="font-bold text-primary">Hubungi CleanID <ArrowRight size={14} className="ml-1 inline" /></a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
            © 2026 CleanID. Semua hak dilindungi.
          </div>
        </Container>
      </footer>
    </div>
  )
}

function HomePage() {
  usePageTitle(DEFAULT_PAGE_TITLE)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const reduceMotion = useReducedMotion()
  const testimonials = [
    { name: 'Nina', text: 'Timnya sangat rapi dan sabar. Rumah saya terasa segar sejak pertama kali dibersihkan.', role: 'Pemilik Rumah' },
    { name: 'Aditya', text: 'Layanan kantor sangat profesional. Jadwalnya tepat dan hasilnya memuaskan.', role: 'Manager Operasional' },
    { name: 'Sari', text: 'Harga terjangkau dengan hasil yang premium. Saya akan pakai lagi.', role: 'Owner Café' },
  ]
  const gallery = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85',
  ]
  const benefits = [
    { title: 'Tim Ahli', icon: Users, text: 'Tenaga profesional berpengalaman dan terlatih.' },
    { title: 'Layanan Berkualitas', icon: BadgeCheck, text: 'Standar kerja konsisten dengan peralatan modern.' },
    { title: 'Harga Terjangkau', icon: Wallet, text: 'Biaya transparan tanpa kejutan di akhir.' },
  ]
  const pricing = [
    { name: 'Basic Plan', price: '30', features: ['Cleaning menyeluruh', 'Ruang tamu', 'Vacuuming karpet dan sofa', 'Dusting seluruh permukaan'] },
    { name: 'Standard Plan', price: '70', popular: true, features: ['Semua layanan Basic', 'Membersihkan kamar mandi', 'Cleaning dapur menyeluruh', 'Layanan prioritas'] },
    { name: 'Premium Plan', price: '120', features: ['Semua layanan Standard', 'Deep cleaning detail', 'Pembersihan kaca', 'High-touch surfaces'] },
  ]

  return (
    <div className="pb-8">
      <section className="relative w-full overflow-hidden pb-10 pt-7 lg:pb-8 lg:pt-10">
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-teal-100/80 blur-3xl" />
        <Container>
        <div className="relative grid min-h-[540px] items-center gap-4 rounded-[30px] bg-white/45 px-0 py-7 sm:px-3 lg:min-h-[calc(100dvh-80px)] lg:grid-cols-[.95fr_1.05fr] lg:py-5">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 px-2 sm:px-4 lg:pl-7">
            <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e8f1ff] px-4 py-2 text-[11px] font-extrabold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Kami CleanID
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-[530px] text-[40px] font-extrabold leading-[1.08] tracking-[-0.055em] text-ink sm:text-5xl lg:text-[58px]">
              Feel Your Way For Freshness
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-[470px] text-[13px] leading-7 text-secondary">
              Rasakan rumah bersih dan nyaman bersama CleanID. Tim profesional kami siap merawat setiap sudut dengan penuh perhatian.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
              <MotionLink to="/layanan" className="bg-primary py-2 pl-5 pr-2 text-xs font-extrabold text-white shadow-soft">
                Layanan Kami <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink"><ArrowRight size={15} /></span>
              </MotionLink>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} aria-label="Putar video CleanID" className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-amber-200">
                <CirclePlay size={19} />
              </motion.button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80',
                ].map((src) => <img key={src} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />)}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] font-extrabold text-white">+65</span>
              </div>
              <div className="text-[11px] font-bold leading-4 text-ink">Klien VIP<br /><span className="font-medium text-secondary">Puas dengan layanan kami</span></div>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-7 grid max-w-[370px] grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-[18px] border border-white bg-white/90 px-4 py-3 shadow-soft">
                <span aria-hidden="true" className="absolute -right-1 -top-2 text-4xl font-extrabold text-blue-50">800+</span>
                <div className="relative text-xl font-extrabold text-primary">800+</div>
                <div className="relative mt-1 text-[10px] font-semibold text-secondary">Klien Puas</div>
              </div>
              <div className="relative overflow-hidden rounded-[18px] border border-white bg-white/90 px-4 py-3 shadow-soft">
                <span aria-hidden="true" className="absolute -right-1 -top-2 text-4xl font-extrabold text-blue-50">180+</span>
                <div className="relative text-xl font-extrabold text-primary">180+</div>
                <div className="relative mt-1 text-[10px] font-semibold text-secondary">Awards Received</div>
              </div>
            </motion.div>
          </motion.div>

          <div className="relative flex min-h-[350px] items-center justify-center sm:min-h-[445px]">
            <div aria-hidden="true" className="absolute bottom-[9%] right-0 h-24 w-[92%] rounded-l-[55%] rounded-r-[15%] bg-gradient-to-r from-[#72a9f7] to-[#a4d9ff]" />
            <div aria-hidden="true" className="absolute left-[10%] top-[14%] text-primary/30"><Sparkles size={22} /></div>
            <div aria-hidden="true" className="absolute right-[9%] top-[20%] text-primary/35"><Sparkles size={17} /></div>
            <div aria-hidden="true" className="absolute left-[18%] top-[43%] h-2 w-2 rounded-full border border-primary/50" />
            <div aria-hidden="true" className="absolute right-[18%] top-[38%] h-3 w-3 rounded-full border border-primary/40" />
            <motion.img
              src="/images/cleaning-bucket.svg"
              alt="Ember biru berisi peralatan kebersihan CleanID"
              className="relative z-10 w-full max-w-[570px] drop-shadow-[0_24px_28px_rgba(26,120,196,0.12)]"
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
        </Container>
      </section>

      <section className="relative z-20 -mt-2 w-full pb-6 lg:-mt-5">
        <Container>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-3 md:grid-cols-3">
          {benefits.map(({ title, icon: Icon, text }) => (
            <motion.div key={title} variants={fadeUp} whileHover={{ y: -5 }} className="rounded-[22px] border border-white/90 bg-white/90 p-5 shadow-glass backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary"><Icon size={20} strokeWidth={1.7} /></div>
              <h3 className="text-sm font-extrabold text-ink">{title}</h3>
              <p className="mt-2 text-[11px] leading-5 text-secondary">{text}</p>
            </motion.div>
          ))}
        </motion.div>
        </Container>
      </section>

      <section id="tentang" className="w-full py-16 lg:py-24">
        <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto h-[370px] w-full max-w-[490px] sm:h-[420px]">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85" alt="Petugas membersihkan ruangan" className="absolute left-0 top-2 h-[260px] w-[61%] rounded-[26px] object-cover shadow-soft sm:h-[310px]" />
            <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=85" alt="Perlengkapan kebersihan" className="absolute right-[4%] top-0 h-32 w-32 rounded-full border-[7px] border-panel object-cover shadow-soft sm:h-40 sm:w-40" />
            <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=85" alt="Dapur yang bersih" className="absolute bottom-0 right-[6%] h-[180px] w-[58%] rounded-[24px] border-[7px] border-panel object-cover shadow-soft sm:h-[220px]" />
            <div className="absolute bottom-5 left-0 z-10 flex h-[86px] w-[86px] flex-col items-center justify-center rounded-[20px] bg-primary text-white shadow-glass sm:h-[100px] sm:w-[100px]">
              <span className="text-3xl font-extrabold">16+</span><span className="text-[9px] font-semibold">Tahun Pengalaman</span>
            </div>
            <span aria-hidden="true" className="absolute bottom-0 left-[18%] h-3 w-3 rounded-full bg-blue-200" />
            <span aria-hidden="true" className="absolute right-0 top-[43%] h-2 w-2 rounded-full bg-teal-200" />
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-[10px] font-extrabold text-primary">Tentang Kami</motion.span>
            <motion.h2 variants={fadeUp} className="mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[38px]">Kami Membuat Tempat Bersih &amp; Cerah</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-[12px] leading-7 text-secondary">Kami berdedikasi menghadirkan ruang yang bersih, sehat, dan nyaman. Dengan layanan yang menyeluruh dan perhatian pada setiap detail, CleanID selalu siap untuk Anda.</motion.p>
            <motion.div variants={fadeUp} className="mt-6 grid grid-cols-3 divide-x divide-blue-100">
              {[['1000+', 'Proyek Selesai'], ['123+', 'Petugas Ahli'], ['400+', 'Pelanggan Setia']].map(([value, label]) => (
                <div key={label} className="px-3 first:pl-0">
                  <div className="text-xl font-extrabold text-primary sm:text-2xl">{value}</div>
                  <div className="mt-1 text-[9px] font-semibold text-secondary sm:text-[10px]">{label}</div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="mt-7">
              <div className="font-signature text-3xl text-ink">Hamida Jannat</div>
              <div className="mt-1 text-[10px] font-extrabold text-ink">Hamida Jannat <span className="font-medium text-secondary">· CEO</span></div>
            </motion.div>
          </motion.div>
        </div>
        </Container>
      </section>

      <section className="w-full py-14 lg:py-24">
        <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-[10px] font-extrabold text-primary">Kenapa Memilih CleanID</span>
            <h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[38px]">Kebersihan terbaik untuk rumah dan bisnis Anda</h2>
            <p className="mt-4 max-w-lg text-[12px] leading-7 text-secondary">Kami membuat proses menjaga kebersihan jadi mudah, aman, dan tepercaya—dengan standar pelayanan yang selalu terjaga.</p>
            <ul className="mt-5 space-y-3 text-[11px] font-semibold text-ink">
              {['Petugas profesional dan terverifikasi', 'Produk pembersih aman untuk keluarga', 'Jadwal fleksibel dan harga transparan'].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primarySoft text-primary"><Check size={12} /></span>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MotionLink to="/layanan" className="bg-primary px-5 py-3 text-[11px] font-bold text-white">Cari Tahu <ArrowRight size={14} /></MotionLink>
              <div className="flex items-center gap-2 text-[10px] font-bold text-ink"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f2ff] text-primary"><Phone size={15} /></span><span>Ada Pertanyaan?<br /><a href="tel:+6281044216305" className="text-primary">+880 10 4421 6305</a></span></div>
            </div>
            <div className="mt-7 flex max-w-[310px] items-center gap-3 rounded-[18px] bg-white p-3 shadow-soft">
              <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=160&q=80" alt="" className="h-14 w-16 rounded-xl object-cover" />
              <div><div className="text-[11px] font-extrabold text-ink">Clean space, happy life</div><div className="mt-1 text-[9px] text-secondary">Tim kami siap membantu setiap hari.</div></div>
              <ArrowRight size={15} className="ml-auto text-primary" />
            </div>
          </div>
          <div className="relative mx-auto h-[370px] w-full max-w-[490px]">
            <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=85" alt="Petugas melakukan pembersihan" className="absolute right-0 top-0 h-[275px] w-[82%] rounded-[26px] object-cover shadow-soft" />
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=650&q=85" alt="Petugas CleanID" className="absolute bottom-0 left-0 h-[205px] w-[54%] rounded-[24px] border-[7px] border-panel object-cover shadow-soft" />
            <div className="absolute bottom-7 right-[3%] rounded-[20px] bg-primary px-5 py-4 text-white shadow-glass"><div className="text-3xl font-extrabold">16+</div><div className="text-[9px] font-semibold">Tahun Pengalaman</div></div>
          </div>
        </div>
        </Container>
      </section>

      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#dceaff] via-[#e4f2ff] to-[#d8f5f0] py-16 lg:py-20">
        <div aria-hidden="true" className="absolute -right-12 top-0 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
        <Container className="relative">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-[10px] font-extrabold text-primary">Paket Harga</span><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-ink">Pilih Paket Terbaikmu</h2></div>
            <p className="max-w-sm text-[11px] leading-6 text-secondary">Paket perawatan terencana untuk ruangan yang bersih dan nyaman setiap saat.</p>
          </div>
          <div className="grid items-center gap-4 md:grid-cols-3">
            {pricing.map(({ name, price, features, popular }) => (
              <motion.div key={name} whileHover={{ y: -5 }} className={`relative rounded-[24px] border bg-white p-5 shadow-soft ${popular ? 'border-primary/50 md:scale-[1.03]' : 'border-white/80'}`}>
                {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[9px] font-extrabold text-white shadow-sm">Populer</div>}
                <h3 className="text-[13px] font-extrabold text-ink">{name}</h3>
                <div className="mt-4 flex items-baseline gap-1"><span className="text-sm font-bold text-primary">Rp</span><span className="text-[38px] font-extrabold leading-none tracking-[-0.05em] text-primary">{price}</span><span className="text-[10px] text-secondary">/bulan</span></div>
                <ul className="mt-5 space-y-3 border-t border-blue-50 pt-4">
                  {features.map((feature) => <li key={feature} className="flex items-center gap-2 text-[10px] font-medium text-secondary"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-primarySoft text-primary"><Check size={10} /></span>{feature}</li>)}
                </ul>
                <MotionLink to="/layanan" className="mt-5 w-full bg-primary px-4 py-3 text-center text-[10px] font-extrabold text-white">Pilih Paket</MotionLink>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full py-16 lg:py-24">
        <Container>
        <div className="mb-6 flex items-end justify-between">
          <div><span className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-[10px] font-extrabold text-primary">Galeri</span><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-ink">Hasil kerja CleanID</h2></div>
          <Link to="/layanan" className="hidden text-[11px] font-bold text-primary sm:block">Lihat layanan <ArrowRight size={13} className="ml-1 inline" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-[3px] overflow-hidden rounded-[22px] sm:grid-cols-3">
          {gallery.map((img, index) => <motion.img key={img + index} whileHover={{ scale: 1.025 }} src={img} alt={`Galeri hasil pembersihan ${index + 1}`} className="h-40 w-full object-cover sm:h-52 lg:h-60" />)}
        </div>
        </Container>
      </section>

      <section id="testimoni" className="w-full py-8">
        <Container>
        <div className="rounded-[26px] bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex items-end justify-between">
            <div><span className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-[10px] font-extrabold text-primary">Testimoni</span><h2 className="mt-3 text-2xl font-extrabold text-ink">Kata pelanggan kami</h2></div>
            <div className="flex gap-2">
              <button aria-label="Testimoni sebelumnya" onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primarySoft text-primary"><ChevronLeft size={17} /></button>
              <button aria-label="Testimoni berikutnya" onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"><ChevronRight size={17} /></button>
            </div>
          </div>
          <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] bg-panel p-5">
            <div className="mb-3 flex gap-1 text-accent">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill="currentColor" />)}</div>
            <p className="text-sm leading-7 text-secondary">“{testimonials[activeTestimonial].text}”</p>
            <div className="mt-4 text-xs font-extrabold text-ink">{testimonials[activeTestimonial].name}<span className="ml-2 font-medium text-secondary">· {testimonials[activeTestimonial].role}</span></div>
          </motion.div>
        </div>
        </Container>
      </section>

      <section id="blog" className="w-full py-12">
        <Container>
        <div className="mb-5"><span className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-[10px] font-extrabold text-primary">Blog &amp; Tips</span><h2 className="mt-3 text-2xl font-extrabold text-ink">Inspirasi ruang bersih</h2></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Cara menjaga kamar mandi selalu segar', gallery[5]],
            ['Tips rumah nyaman untuk keluarga', gallery[1]],
            ['Checklist praktis sebelum pindah rumah', gallery[4]],
          ].map(([title, img]) => <article key={title} className="overflow-hidden rounded-[20px] bg-white shadow-soft"><img src={img} alt="" className="h-36 w-full object-cover" /><h3 className="p-4 text-xs font-extrabold leading-5 text-ink">{title}</h3></article>)}
        </div>
        </Container>
      </section>

      <section className="w-full py-10 lg:py-16">
        <Container>
        <div className="flex flex-col gap-5 rounded-[26px] bg-gradient-to-r from-[#4a8ff0] to-[#52b8e8] p-6 text-white shadow-glass sm:p-8 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Minta Penawaran Gratis</h2><p className="mt-2 max-w-md text-[11px] leading-6 text-blue-50">Hubungi tim kami untuk menemukan layanan terbaik sesuai kebutuhan ruang Anda.</p></div>
          <a href="tel:+6281044216305" className="inline-flex items-center gap-3 self-start rounded-full bg-white/15 py-2 pl-2 pr-5 text-[11px] font-extrabold backdrop-blur sm:self-auto"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary"><Phone size={16} /></span><span>Hubungi Kami<br /><span className="font-semibold text-blue-50">+62 810 4421 6305</span></span></a>
        </div>
        </Container>
      </section>
    </div>
  )
}

function LegacyHomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const reduceMotion = useReducedMotion()

  const testimonials = [
    { name: 'Nina', text: 'Timnya sangat rapi dan sabar. Rumah saya terasa segar sejak pertama kali dibersihkan.', role: 'Pemilik Rumah' },
    { name: 'Aditya', text: 'Layanan kantor sangat profesional. Jadwalnya tepat dan hasilnya memuaskan.', role: 'Manager Operasional' },
    { name: 'Sari', text: 'Harga terjangkau dengan hasil yang premium. Saya akan pakai lagi.', role: 'Owner Café' },
  ]

  return (
    <div className="pb-12">
      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pb-16">
        <div className="grid gap-6 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(106,160,255,0.22),_transparent_35%),linear-gradient(135deg,_#f5fafe_0%,_#e9f2ff_35%,_#dff7ff_100%)] p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative flex flex-col justify-center">
            <motion.div variants={fadeUp} className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
              <BadgeCheck size={14} /> Kami CleanID
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-md text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Rasakan Kesegaran di Setiap Sudut
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              Platform jasa kebersihan terpercaya untuk rumah, kantor, dan ruang usaha. Tim profesional siap membuat lingkungan Anda lebih sehat, bersih, dan nyaman.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/layanan" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-500">
                Lihat Layanan <ArrowRight size={16} />
              </Link>
              <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-sm"><CirclePlay size={16} /></span>
                Lihat Video
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2">
                {['A', 'B', 'C'].map((letter, idx) => (
                  <div key={letter} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${idx === 0 ? 'bg-blue-400' : idx === 1 ? 'bg-cyan-500' : 'bg-amber-400'}`}>
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Klien VIP</div>
                <div className="text-xs text-slate-500">500+ pelanggan aktif</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid max-w-lg gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
                <div className="text-2xl font-extrabold text-primary">800+</div>
                <div className="text-sm text-slate-600">Happy Clients</div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
                <div className="text-2xl font-extrabold text-primary">180+</div>
                <div className="text-sm text-slate-600">Awards</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative flex min-h-[440px] items-end justify-center overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1ca5d6] via-[#1c9ad9] to-[#0f7cc0] p-6">
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 flex h-[280px] w-[82%] items-end justify-center rounded-[28px] bg-[#1a9eea] shadow-[0_40px_70px_rgba(19,126,200,0.33)]"
            >
              <div className="absolute -top-16 left-12 flex h-12 w-12 items-center justify-center rounded-full bg-white/60 text-white">🧼</div>
              <div className="absolute -top-12 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/60 text-white">✨</div>
              <div className="absolute left-8 bottom-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">🧽</div>
              <div className="absolute right-8 bottom-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl">🧴</div>
              <div className="absolute -bottom-8 h-16 w-56 rounded-full bg-[#1e90d5] blur-xl" />
              <div className="relative mb-6 flex h-[190px] w-[70%] items-center justify-center rounded-[22px] bg-white/15 p-5 shadow-inner">
                <div className="absolute inset-0 rounded-[22px] border border-white/30" />
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {['🧽', '🧴', '🧼', '🪣', '✨', '🧹', '🧺', '🧻'].map((item, idx) => (
                    <div key={idx} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-sm backdrop-blur-sm">{item}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Tim Ahli', icon: Users, text: 'Teknisi bersertifikat dan berpengalaman' },
            { title: 'Layanan Berkualitas', icon: ShieldCheck, text: 'Standar kebersihan tinggi dan aman' },
            { title: 'Harga Terjangkau', icon: Wallet, text: 'Jelas, transparan, tanpa biaya tersembunyi' },
          ].map(({ title, icon: Icon, text }) => (
            <motion.div key={title} {...cardHover} className="rounded-[26px] border border-slate-200 bg-white/80 p-5 shadow-soft">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primarySoft text-primary"><Icon size={22} /></div>
              <h3 className="text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Tentang Kami</div>
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Kami membuat ruang Anda lebih hidup, sehat, dan terasa nyaman.</h2>
            <p className="text-base leading-8 text-slate-600">Dengan pengalaman bertahun-tahun, CleanID menghadirkan layanan kebersihan yang menyesuaikan kebutuhan rumah, kantor, hingga proyek khusus.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '1000+', label: 'Proyek selesai' },
                { value: '123+', label: 'Petugas' },
                { value: '400+', label: 'Pelanggan setia' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                  <div className="text-2xl font-extrabold text-primary">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[430px] flex-col items-center justify-center">
            <div className="relative h-[300px] w-[420px] max-w-full rounded-[28px] bg-[linear-gradient(135deg,#8ad4ff_0%,#63b2f5_40%,#dbeeff_100%)] p-4 shadow-soft">
              <div className="grid h-full grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80" alt="cleaning" className="h-full w-full rounded-[24px] object-cover" />
                <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=80" alt="cleaning" className="h-full w-full rounded-[24px] object-cover" />
              </div>
            </div>
            <div className="absolute -left-4 bottom-2 flex h-24 w-24 items-center justify-center rounded-[22px] bg-[#5a9af3] text-3xl font-black text-white shadow-soft">16+</div>
            <div className="absolute right-4 top-8 rounded-2xl bg-white px-4 py-3 shadow-soft">
              <div className="text-lg font-bold text-ink">16+</div>
              <div className="text-xs text-slate-600">Tahun pengalaman</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Kenapa Memilih CleanID</div>
          <h2 className="mt-4 text-3xl font-extrabold text-ink">Lebih dari sekadar pembersih, tapi partner kenyamanan Anda.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {['Tepat waktu', 'Petugas terlatih', 'Alat dan bahan ramah lingkungan', 'Layanan fleksibel'].map((item) => (
            <div key={item} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf8ff] text-primary"><Check size={18} /></div>
              <div className="text-lg font-bold text-ink">{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Paket Harga</div>
          <h2 className="mt-4 text-3xl font-extrabold text-ink">Pilih paket terbaikmu</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { name: 'Basic', price: 30000, features: ['Pembersihan dasar', 'Area terbatas', 'Cocok untuk apartemen kecil'] },
            { name: 'Standard', price: 70000, features: ['Area lebih luas', 'Layanan intensif', 'Smart scheduling'], popular: true },
            { name: 'Premium', price: 120000, features: ['Segala area', 'Deep clean', 'Fleksibel dan prioritas'] },
          ].map(({ name, price, features, popular }) => (
            <div key={name} className={`rounded-[28px] border p-6 shadow-soft ${popular ? 'border-primary bg-[#edf5ff]' : 'border-slate-200 bg-white'}`}>
              {popular && <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Populer</div>}
              <div className="text-xl font-bold text-ink">{name}</div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-ink">Rp {price.toLocaleString('id-ID')}</span>
                <span className="pb-2 text-sm text-slate-500">/ bulan</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check size={16} className="mt-0.5 text-primary" /> {f}</li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Pilih Paket</button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Galeri</div>
            <h2 className="mt-4 text-3xl font-extrabold text-ink">Hasil kerja yang rapi dan konsisten</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
          ].map((img, idx) => (
            <motion.img key={img + idx} whileHover={{ scale: 1.02 }} src={img} alt="Gallery" className="h-64 w-full rounded-[24px] object-cover shadow-soft" />
          ))}
        </div>
      </section>

      <section id="testimoni" className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="rounded-[32px] bg-[#ebf5ff] p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">Testimoni</div>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">Apa kata pelanggan kami?</h2>
            </div>
            <div className="hidden gap-3 sm:flex">
              <button onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-[28px] bg-primary p-6 text-white">
              <div className="flex items-center gap-2 text-amber-300">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} fill="currentColor" />)}</div>
              <div className="mt-5 text-5xl font-extrabold">4.9</div>
              <p className="mt-3 text-sm leading-7 text-blue-100">Berdasarkan 1.200+ review pelanggan yang puas dengan hasil pembersihan CleanID.</p>
            </div>
            <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="text-lg leading-8 text-slate-700">“{testimonials[activeTestimonial].text}”</div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <div className="font-bold text-ink">{testimonials[activeTestimonial].name}</div>
                  <div className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</div>
                </div>
                <div className="rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold text-primary">Verified</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="blog" className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="rounded-[32px] bg-[#f8fbff] p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Blog & Tips</div>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">Tips menjaga rumah tetap bersih</h2>
            </div>
            <Link to="/layanan" className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white sm:inline-flex">Lihat layanan</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: 'Cara menjaga kebersihan kamar mandi', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
              { title: 'Motivasi membersihkan rumah setiap minggu', img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80' },
              { title: 'Checklist sebelum pindah rumah', img: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80' },
            ].map((post) => (
              <div key={post.title} className="overflow-hidden rounded-[24px] bg-white shadow-sm">
                <img src={post.img} alt={post.title} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Clean Tips</div>
                  <div className="text-lg font-bold text-ink">{post.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[32px] bg-gradient-to-r from-primary to-[#3ba7f2] p-8 text-white shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-extrabold">Pesan Sekarang</div>
            <p className="mt-2 text-blue-100">Dapatkan konsultasi gratis dan jadwal yang sesuai kebutuhan Anda.</p>
          </div>
          <Link to="/layanan" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-primary">Gratis Konsultasi</Link>
        </div>
      </section>
    </div>
  )
}

function ServicesPage() {
  usePageTitle('Layanan')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = selectedCategory === 'Semua' || service.category === selectedCategory
      const searchText = `${service.name} ${service.description}`.toLowerCase()
      return matchesCategory && searchText.includes(search.toLowerCase())
    })
  }, [search, selectedCategory])

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-5 rounded-[28px] bg-[#edf5ff] p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">Layanan Kami</div>
          <h1 className="mt-4 text-3xl font-extrabold text-ink">Temukan layanan kebersihan yang pas untuk Anda</h1>
        </div>
        <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari layanan..." className="w-full bg-transparent text-sm text-slate-700 outline-none" />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
        {filteredServices.map((service) => (
          <motion.div layout key={service.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} whileHover={{ y: -6 }} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
            <motion.img layoutId={`service-image-${service.id}`} src={service.image} alt={service.name} className="h-56 w-full object-cover" />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold text-primary">{service.category}</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-500"><Star size={14} fill="currentColor" /> {service.rating}</span>
              </div>
              <motion.h3 layoutId={`service-title-${service.id}`} className="text-xl font-bold text-ink">{service.name}</motion.h3>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2"><Clock3 size={15} /> {service.duration}</span>
                <motion.span layoutId={`service-price-${service.id}`} className="font-bold text-primary">Rp {service.price.toLocaleString('id-ID')}</motion.span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
              <MotionLink to={`/layanan/${service.id}`} className="mt-5 bg-primary px-4 py-2 text-sm font-semibold text-white">Lihat Detail</MotionLink>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </Container>
  )
}

function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const selectedService = services.find((item) => item.id === id)
  usePageTitle(selectedService?.name || 'Halaman Tidak Ditemukan')

  if (!selectedService) return <NotFoundPage />

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
            <motion.img layoutId={`service-image-${selectedService.id}`} src={selectedService.image} alt={selectedService.name} className="h-[380px] w-full object-cover" />
          </div>
          <div className="mt-8 rounded-[28px] bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold text-primary">{selectedService.category}</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-500"><Star size={14} fill="currentColor" /> {selectedService.rating}</span>
            </div>
            <motion.h1 layoutId={`service-title-${selectedService.id}`} className="text-3xl font-extrabold text-ink">{selectedService.name}</motion.h1>
            <p className="mt-4 text-base leading-8 text-slate-600">{selectedService.description}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-ink">Yang termasuk</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {selectedService.features.map((item) => (
                    <li key={item} className="flex items-start gap-2"><Check size={16} className="mt-0.5 text-primary" /> {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Yang tidak termasuk</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {selectedService.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2"><X size={16} className="mt-0.5 text-red-500" /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:pt-10">
          <div className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Mulai dari</div>
              <motion.div layoutId={`service-price-${selectedService.id}`} className="text-3xl font-extrabold text-primary">Rp {selectedService.price.toLocaleString('id-ID')}</motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Clock3 size={15} /> Estimasi {selectedService.duration}</div>
            <div className="mt-6 rounded-2xl bg-primarySoft p-4 text-sm text-slate-700">
              <div className="font-semibold text-ink">Lapangan kerja</div>
              <div className="mt-2">Rumah, kantor, dan area komersial siap dikerjakan.</div>
            </div>
            <MotionLink to={`/pesan/${id}`} className="mt-6 w-full bg-primary px-5 py-3 text-center font-semibold text-white">Pesan Sekarang <ArrowRight size={15} /></MotionLink>
            <MotionLink to="/layanan" className="mt-3 w-full border border-slate-200 bg-white px-5 py-3 text-center font-semibold text-slate-700">Lihat Layanan Lain</MotionLink>
          </div>
        </div>
      </div>
    </Container>
  )
}

function LoginPage() {
  usePageTitle('Masuk')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email tidak valid.'
    if (form.password.length < 8) nextErrors.password = 'Password minimal 8 karakter.'
    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    const user = { ...defaultUser, email: form.email, fullName: 'Pengguna CleanID' }
    login(user)
    navigate('/')
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-md rounded-[30px] bg-white p-6 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primarySoft text-primary"><Lock size={24} /></div>
          <h1 className="text-3xl font-extrabold text-ink">Masuk</h1>
          <p className="mt-2 text-sm text-slate-500">Akses akun CleanID Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <div className="flex items-center rounded-2xl border border-slate-200 px-4 py-3">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-transparent outline-none" />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-xs font-semibold text-primary">{showPassword ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
            {errors.password && <div className="mt-1 text-xs text-red-500">{errors.password}</div>}
          </div>
          <MotionButton type="submit" isLoading={isSubmitting} loadingLabel="Sedang masuk..." className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Masuk</MotionButton>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Belum punya akun? <Link to="/daftar" className="font-semibold text-primary">Daftar</Link>
        </p>
      </div>
    </Container>
  )
}

function RegisterPage() {
  usePageTitle('Daftar')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const nextErrors = {}
    if (!form.fullName.trim()) nextErrors.fullName = 'Nama lengkap wajib diisi.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email tidak valid.'
    if (!/^08\d{8,11}$/.test(form.phone)) nextErrors.phone = 'Nomor HP harus format Indonesia.'
    if (form.password.length < 8) nextErrors.password = 'Password minimal 8 karakter.'
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Konfirmasi password tidak cocok.'
    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    const user = { ...defaultUser, fullName: form.fullName, email: form.email, phone: form.phone }
    login(user)
    navigate('/')
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-xl rounded-[30px] bg-white p-6 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primarySoft text-primary"><UserRound size={24} /></div>
          <h1 className="text-3xl font-extrabold text-ink">Daftar</h1>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nama lengkap</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.fullName && <div className="mt-1 text-xs text-red-500">{errors.fullName}</div>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.phone && <div className="mt-1 text-xs text-red-500">{errors.phone}</div>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.password && <div className="mt-1 text-xs text-red-500">{errors.password}</div>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Konfirmasi password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            {errors.confirmPassword && <div className="mt-1 text-xs text-red-500">{errors.confirmPassword}</div>}
          </div>
          <MotionButton type="submit" isLoading={isSubmitting} loadingLabel="Sedang mendaftar..." className="md:col-span-2 mt-2 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Daftar</MotionButton>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Sudah punya akun? <Link to="/masuk" className="font-semibold text-primary">Masuk</Link>
        </p>
      </div>
    </Container>
  )
}

function BookingPage() {
  usePageTitle('Pesan')
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setService, setVariant, setAddons, setDate, setTime, setAddress, setNotes, serviceId: selectedServiceId, variant, addonIds, selectedDate, selectedTime, addressId, notes, orders, addOrder } = useBooking()
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addresses, setAddresses] = useState(readAddresses())
  const [newAddress, setNewAddress] = useState({ label: 'Rumah', recipient: user?.fullName || '', phone: user?.phone || '', address: '', city: '', postal: '', note: '' })

  const service = services.find((item) => item.id === (serviceId || selectedServiceId))
  useEffect(() => {
    if (serviceId && selectedServiceId !== serviceId) setService(serviceId)
  }, [serviceId, selectedServiceId, setService])

  const variants = [
    { label: 'Standar', price: 0 },
    { label: 'Plus', price: 120000 },
    { label: 'Premium', price: 240000 },
  ]

  const addOns = [
    { id: 'setrika', label: 'Setrika', price: 90000 },
    { id: 'cuci-kaca', label: 'Cuci Kaca', price: 70000 },
    { id: 'deep-foam', label: 'Deep Foam', price: 130000 },
  ]

  const addressList = addresses.length ? addresses : defaultAddresses
  const activeAddress = addressList.find((item) => item.id === addressId) || addressList[0]
  const selectedAddons = addOns.filter((item) => addonIds.includes(item.id))

  const subtotal = (service?.price || 0) + (variants.find((item) => item.label === variant)?.price || 0) + selectedAddons.reduce((sum, item) => sum + item.price, 0)

  const handleAddAddress = (e) => {
    e.preventDefault()
    const address = { ...newAddress, id: `addr-${Date.now()}`, primary: false }
    const all = [...addresses, address]
    setAddresses(all)
    saveAddresses(all)
    setAddress(address.id)
    setIsAddressModalOpen(false)
    setNewAddress({ label: 'Rumah', recipient: user?.fullName || '', phone: user?.phone || '', address: '', city: '', postal: '', note: '' })
  }

  const handleContinue = () => {
    if (!service || !selectedDate || !selectedTime || !activeAddress) return
    navigate('/checkout')
  }

  return (
    <Container className="py-10">
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Alur Pesanan</div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Buat pesanan kebersihan Anda</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[28px] bg-white p-6 shadow-soft">
          <div>
            <h2 className="text-xl font-bold text-ink">1. Pilih varian</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {variants.map((item) => (
                <button key={item.label} onClick={() => setVariant(item.label)} className={`rounded-[22px] border p-4 text-left ${variant === item.label ? 'border-primary bg-primarySoft' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-base font-bold text-ink">{item.label}</div>
                  <div className="mt-2 text-sm text-slate-600">{item.price ? `+Rp ${item.price.toLocaleString('id-ID')}` : 'Termasuk'}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">2. Tambah add-on</h2>
            <div className="mt-4 space-y-3">
              {addOns.map((item) => (
                <label key={item.id} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-ink">{item.label}</div>
                    <div className="text-sm text-slate-500">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <input type="checkbox" checked={addonIds.includes(item.id)} onChange={() => {
                    if (addonIds.includes(item.id)) setAddons(addonIds.filter((id) => id !== item.id))
                    else setAddons([...addonIds, item.id])
                  }} className="h-5 w-5 accent-primary" />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">3. Pilih tanggal & waktu</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal</label>
                <input type="date" min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Waktu</label>
                <select value={selectedTime} onChange={(e) => setTime(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary">
                  <option value="">Pilih slot</option>
                  {['08:00', '10:00', '13:00', '15:00'].map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">4. Pilih alamat</h2>
              <button onClick={() => setIsAddressModalOpen(true)} className="rounded-full bg-primarySoft px-3 py-2 text-sm font-semibold text-primary">Tambah alamat</button>
            </div>
            <div className="space-y-3">
              {addressList.map((item) => (
                <button key={item.id} onClick={() => setAddress(item.id)} className={`w-full rounded-[22px] border p-4 text-left ${activeAddress?.id === item.id ? 'border-primary bg-primarySoft' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{item.label}</span>
                    {item.primary && <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">Utama</span>}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">{item.recipient} · {item.phone}</div>
                  <div className="text-sm text-slate-600">{item.address}, {item.city}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">5. Catatan khusus</h2>
            <textarea value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} placeholder="Ada hewan peliharaan, mohon hati-hati dengan kaca..." className="mt-3 min-h-[120px] w-full rounded-[22px] border border-slate-200 bg-slate-50 p-4 outline-none focus:border-primary" />
            <div className="mt-2 text-right text-xs text-slate-500">{notes.length}/300</div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-ink">Ringkasan pesanan</h2>
          <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
            <div className="text-base font-bold text-ink">{service?.name}</div>
            <div className="mt-2 text-sm text-slate-600">Varian: {variant}</div>
            <div className="mt-1 text-sm text-slate-600">Tanggal: {selectedDate || '-'}</div>
            <div className="mt-1 text-sm text-slate-600">Waktu: {selectedTime || '-'}</div>
            <div className="mt-1 text-sm text-slate-600">Alamat: {activeAddress ? `${activeAddress.address}, ${activeAddress.city}` : '-'}</div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Biaya layanan</span><span>Rp {Math.round(subtotal * 0.08).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Diskon</span><span>Rp 0</span></div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-ink"><span>Total</span><span>Rp {(subtotal + Math.round(subtotal * 0.08)).toLocaleString('id-ID')}</span></div>
          </div>
          <button onClick={handleContinue} className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Lanjut ke Checkout</button>
        </div>
      </div>

      <Modal open={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} label="Tambah alamat">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-ink">Tambah alamat</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="rounded-full bg-slate-100 p-2"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddAddress} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Label</label>
                <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
                  <option>Rumah</option>
                  <option>Kantor</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nama penerima</label>
                <input value={newAddress.recipient} onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</label>
                <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Kota</label>
                <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Alamat lengkap</label>
                <textarea value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="min-h-[96px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Kode pos</label>
                <input value={newAddress.postal} onChange={(e) => setNewAddress({ ...newAddress, postal: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Patokan</label>
                <input value={newAddress.note} onChange={(e) => setNewAddress({ ...newAddress, note: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              </div>
              <button type="submit" className="md:col-span-2 mt-2 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Simpan alamat</button>
            </form>
      </Modal>
    </Container>
  )
}

function CheckoutPage() {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { serviceId, variant, addonIds, selectedDate, selectedTime, addressId, notes, promoCode, paymentMethod, setPromoCode, setPaymentMethod, addOrder, orders, resetBooking } = useBooking()
  const [isConfirming, setIsConfirming] = useState(false)
  const addresses = readAddresses()
  const service = services.find((item) => item.id === serviceId)
  const activeAddress = addresses.find((item) => item.id === addressId) || addresses[0]
  const selectedAddons = [{ id: 'setrika', label: 'Setrika', price: 90000 }, { id: 'cuci-kaca', label: 'Cuci Kaca', price: 70000 }, { id: 'deep-foam', label: 'Deep Foam', price: 130000 }].filter((item) => addonIds.includes(item.id))
  const subtotal = (service?.price || 0) + (variant === 'Plus' ? 120000 : variant === 'Premium' ? 240000 : 0) + selectedAddons.reduce((sum, item) => sum + item.price, 0)
  const discount = promoCode === 'CLEAN10' ? subtotal * 0.1 : 0
  const serviceFee = subtotal * 0.08
  const total = subtotal + serviceFee - discount

  const handleConfirmOrder = async () => {
    setIsConfirming(true)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    const orderId = `CLN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`
    const nextOrder = {
      id: orderId,
      userId: user.id,
      serviceId: serviceId,
      serviceName: service?.name,
      date: selectedDate,
      time: selectedTime,
      address: activeAddress,
      notes,
      amount: total,
      status: 'Menunggu Pembayaran',
      paymentMethod,
      variant,
      addons: selectedAddons,
      createdAt: new Date().toISOString(),
      customerName: user?.fullName || 'Pengguna',
    }
    addOrder(nextOrder)
    resetBooking()
    navigate(`/pesanan/${orderId}`, { state: { justCreated: true } })
  }

  return (
    <Container className="py-10">
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Checkout</div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Konfirmasi pesanan Anda</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[28px] bg-white p-6 shadow-soft">
          <div>
            <h2 className="text-xl font-bold text-ink">Metode pembayaran</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`rounded-[20px] border p-4 text-left ${paymentMethod === method ? 'border-primary bg-primarySoft' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="font-semibold text-ink">{method}</div>
                  <div className="text-sm text-slate-500">{method === 'Transfer Bank' ? 'VA BCA/BNI/Mandiri' : method === 'E-Wallet' ? 'GoPay, OVO, DANA' : method === 'QRIS' ? 'Pembayaran cepat' : 'Bayar saat petugas datang'}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">Kode promo</h2>
            <div className="mt-3 flex gap-3">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Masukkan kode promo" className="flex-1 rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              <button className="rounded-full bg-primary px-4 py-3 font-semibold text-white">Terapkan</button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-ink">Ringkasan biaya</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Layanan</span><span>{service?.name}</span></div>
            <div className="flex justify-between"><span>Varian</span><span>{variant}</span></div>
            <div className="flex justify-between"><span>Add-on</span><span>{selectedAddons.length ? selectedAddons.map((a) => a.label).join(', ') : 'Tidak ada'}</span></div>
            <div className="flex justify-between"><span>Tanggal</span><span>{selectedDate}</span></div>
            <div className="flex justify-between"><span>Waktu</span><span>{selectedTime}</span></div>
            <div className="flex justify-between"><span>Alamat</span><span>{activeAddress ? activeAddress.city : '-'}</span></div>
            <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
              <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Biaya layanan</span><span>Rp {serviceFee.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Diskon</span><span>-Rp {discount.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between text-lg font-bold text-ink"><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
            </div>
          </div>
          <MotionButton onClick={handleConfirmOrder} isLoading={isConfirming} loadingLabel="Mengonfirmasi..." className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Konfirmasi Pesanan</MotionButton>
        </div>
      </div>
    </Container>
  )
}

function OrdersPage() {
  usePageTitle('Pesanan Saya')
  const { orders, ordersLoading, ordersError } = useBooking()
  const { user } = useAuth()
  const [tab, setTab] = useState('Semua')
  const navigate = useNavigate()

  const tabs = ['Semua', 'Berlangsung', 'Selesai', 'Dibatalkan']
  const ownedOrders = orders.filter((order) => order.userId === user?.id)
    .sort((first, second) => new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime())
  const filteredOrders = ownedOrders.filter((order) => {
    if (tab === 'Semua') return true
    if (tab === 'Berlangsung') return !['Selesai', 'Dibatalkan'].includes(order.status)
    if (tab === 'Selesai') return order.status === 'Selesai'
    return order.status === 'Dibatalkan'
  })

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-primary">Pesanan Saya</div>
          <h1 className="mt-4 text-3xl font-extrabold text-ink">Riwayat pesanan</h1>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((item) => {
          const count = item === 'Semua'
            ? ownedOrders.length
            : ownedOrders.filter((order) => item === 'Berlangsung'
              ? !['Selesai', 'Dibatalkan'].includes(order.status)
              : order.status === item).length
          return (
          <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>
            {item} <span className="ml-1 opacity-75">({count})</span>
          </button>
          )
        })}
      </div>

      {ordersLoading ? (
        <div aria-label="Memuat riwayat pesanan" className="space-y-4">
          {[0, 1].map((item) => <div key={item} className="h-32 animate-pulse rounded-[28px] bg-white shadow-soft" />)}
        </div>
      ) : ordersError ? (
        <div role="alert" className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">{ordersError}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primarySoft text-primary"><PackageCheck size={28} /></div>
          <h3 className="text-2xl font-bold text-ink">{ownedOrders.length ? 'Tidak ada pesanan di kategori ini' : 'Belum ada pesanan'}</h3>
          <p className="mt-2 text-slate-600">{ownedOrders.length ? 'Pilih tab lain untuk melihat pesanan Anda.' : 'Jadwalkan layanan kebersihan Anda segera.'}</p>
          {!ownedOrders.length && <button onClick={() => navigate('/layanan')} className="mt-5 rounded-full bg-primary px-5 py-3 font-semibold text-white">Pesan Sekarang</button>}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div layout key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-[26px] bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <motion.div layoutId={`order-number-${order.id}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{order.id}</motion.div>
                  <div className="mt-2 text-xl font-bold text-ink">{order.serviceName}</div>
                  <div className="mt-2 text-sm text-slate-600">{order.variant}{order.addons?.length ? ` · ${order.addons.map((addon) => addon.label).join(', ')}` : ''}</div>
                  <div className="mt-1 text-sm text-slate-600">{order.date} · {order.time}</div>
                  <div className="mt-1 text-sm text-slate-600">{order.address?.address}, {order.address?.city}</div>
                  <div className="mt-1 text-sm font-bold text-ink">Rp {(order.amount || 0).toLocaleString('id-ID')} · {order.paymentMethod}</div>
                  <div className="mt-1 text-xs text-slate-500">Dibuat {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.span layoutId={`order-status-${order.id}`} className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : order.status === 'Dibatalkan' ? 'bg-red-50 text-red-600' : 'bg-primarySoft text-primary'}`}>{order.status}</motion.span>
                  <button onClick={() => navigate(`/pesanan/${order.id}`)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Detail</button>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </Container>
  )
}

function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { updateOrder, orders, ordersLoading, ordersError } = useBooking()
  const [toast, showToast] = useToast()
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(Boolean(location.state?.justCreated))
  const navigateAfterSuccess = useRef(false)
  const reduceMotion = useReducedMotion()
  const order = orders.find((item) => item.id === id && item.userId === user?.id)
  usePageTitle(order?.id || (ordersLoading ? 'Detail Pesanan' : 'Pesanan Tidak Ditemukan'))
  if (ordersLoading) {
    return <Container className="py-10"><div aria-label="Memuat detail pesanan" className="h-96 animate-pulse rounded-[28px] bg-white shadow-soft" /></Container>
  }
  if (ordersError) {
    return <Container className="py-10"><div role="alert" className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">{ordersError}</div></Container>
  }
  if (!order) return <OrderNotFoundPage />

  const statusIndex = statusList.indexOf(order.status)
  const enableCancel = !['Dalam Pengerjaan', 'Selesai', 'Dibatalkan'].includes(order.status)

  const handleMarkPaid = () => {
    updateOrder({ ...order, status: 'Dikonfirmasi' })
    showToast('Pembayaran berhasil dikonfirmasi.')
  }
  const handleCancel = () => {
    if (!enableCancel) return
    setShowCancelConfirmation(true)
  }
  const confirmCancel = () => {
    updateOrder({
      ...order,
      status: 'Dibatalkan',
      cancellationReason: 'Dibatalkan oleh pengguna',
      cancellationFee: 0,
      cancelledAt: new Date().toISOString(),
    })
    setShowCancelConfirmation(false)
    showToast('Pesanan berhasil dibatalkan.')
  }

  return (
    <Container className="py-10">
      <Toast message={toast} />
      <Modal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onExitComplete={() => {
          if (!navigateAfterSuccess.current) return
          navigateAfterSuccess.current = false
          navigate(`/pesanan/${order.id}`, { replace: true, state: {} })
        }}
        label="Pesanan berhasil dibuat"
      >
            <div className="relative overflow-hidden text-center">
              {!reduceMotion && Array.from({ length: 12 }, (_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: -12, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 24 + (index % 4) * 9], x: [(index % 2 ? 1 : -1) * (12 + index * 2)] }}
                  transition={{ duration: 1.1, delay: index * 0.035 }}
                  className="absolute top-2 h-2 w-2 rounded-full"
                  style={{ left: `${12 + (index * 17) % 76}%`, backgroundColor: ['#4A8FF0', '#F5B400', '#5eead4'][index % 3] }}
                />
              ))}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', stiffness: 220, damping: 14 } }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primarySoft text-primary">
                <motion.svg viewBox="0 0 40 40" className="h-11 w-11" fill="none">
                  <motion.path d="m10 21 7 7 14-16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }} />
                </motion.svg>
              </motion.div>
              <h2 className="mt-5 text-2xl font-extrabold text-ink">Pesanan berhasil dibuat!</h2>
              <p className="mt-2 text-sm text-secondary">Kami menyiapkan layanan terbaik untuk jadwal Anda.</p>
              <div className="mt-5 rounded-2xl bg-panel px-4 py-3 text-sm font-extrabold tracking-wide text-primary">{order.id}</div>
              <button onClick={() => { navigateAfterSuccess.current = true; setShowSuccess(false) }} className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">Lihat Pesanan</button>
            </div>
      </Modal>
      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <motion.div layoutId={`order-number-${order.id}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{order.id}</motion.div>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">{order.serviceName}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-secondary"><Avatar src={user?.avatar} name={user?.fullName || 'Pengguna'} size="sm" />{order.customerName || user?.fullName}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleMarkPaid} className="rounded-full bg-primary px-4 py-2 font-semibold text-white">Saya Sudah Bayar</button>
            {enableCancel && <button onClick={handleCancel} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600">Batalkan</button>}
          </div>
        </div>
        <motion.div layoutId={`order-status-${order.id}`} className="mt-4 inline-flex rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold text-primary">{order.status}</motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {statusList.map((item, index) => (
            <div key={item} className={`flex items-center gap-3 rounded-[20px] p-3 ${index <= statusIndex ? 'bg-primarySoft text-primary' : 'bg-slate-100 text-slate-500'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${index <= statusIndex ? 'bg-primary text-white' : 'bg-white text-slate-500'}`}>
                {index <= statusIndex ? <Check size={16} /> : index + 1}
              </div>
              <span className="font-semibold">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[22px] bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-ink">Info pesanan</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Varian</span><span>{order.variant}</span></div>
              <div className="flex justify-between"><span>Tanggal</span><span>{order.date}</span></div>
              <div className="flex justify-between"><span>Waktu</span><span>{order.time}</span></div>
              <div className="flex justify-between"><span>Metode pembayaran</span><span>{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Total</span><span>Rp {order.amount.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Varian & add-on</span><span>{order.variant}{order.addons?.length ? ` · ${order.addons.map((addon) => addon.label).join(', ')}` : ''}</span></div>
              <div className="flex justify-between"><span>Dibuat</span><span>{order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}</span></div>
              {order.status === 'Dibatalkan' && <>
                <div className="flex justify-between"><span>Alasan pembatalan</span><span>{order.cancellationReason || 'Tidak dicantumkan'}</span></div>
                <div className="flex justify-between"><span>Biaya pembatalan</span><span>Rp {(order.cancellationFee || 0).toLocaleString('id-ID')}</span></div>
              </>}
            </div>
          </div>
          <div className="rounded-[22px] bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-ink">Alamat & catatan</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>{order.address?.recipient} · {order.address?.phone}</div>
              <div>{order.address?.address}</div>
              <div>{order.address?.city} {order.address?.postal}</div>
              <div className="pt-2 text-slate-700">Catatan: {order.notes || 'Tidak ada catatan khusus'}</div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={showCancelConfirmation} onClose={() => setShowCancelConfirmation(false)} label="Konfirmasi pembatalan pesanan">
        <h2 className="text-xl font-extrabold text-ink">Batalkan pesanan?</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">Pesanan ini akan ditandai sebagai dibatalkan. Anda yakin ingin melanjutkan?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowCancelConfirmation(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Kembali</button>
          <button onClick={confirmCancel} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">Ya, batalkan</button>
        </div>
      </Modal>
    </Container>
  )
}

function ProfilePage() {
  usePageTitle('Profil')
  const { user, updateUser, logout } = useAuth()
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' })
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [toast, showToast] = useToast()
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateUser({ avatar: typeof reader.result === 'string' ? reader.result : null })
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => updateUser({ avatar: null })

  const handleSave = (e) => {
    e.preventDefault()
    updateUser(form)
    showToast('Profil berhasil diperbarui.')
  }

  return (
    <Container className="py-10">
      <Toast message={toast} />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <Avatar src={user?.avatar} name={user?.fullName || 'Pengguna'} size="lg" className="shadow-sm" />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <label className="cursor-pointer rounded-full bg-primarySoft px-4 py-2 text-sm font-semibold text-primary">Ubah Foto<input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} /></label>
              <button type="button" onClick={removeAvatar} disabled={!user?.avatar} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">Hapus Foto</button>
            </div>
            <div className="mt-4 text-2xl font-extrabold text-ink">{user?.fullName || 'Pengguna'}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
          </div>
        </div>

        <div className="space-y-6 rounded-[28px] bg-white p-6 shadow-soft">
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nama lengkap</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            </div>
            <button type="submit" className="md:col-span-2 rounded-full bg-primary px-5 py-3 font-semibold text-white">Simpan profil</button>
          </form>

          <div className="rounded-[24px] bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-ink">Ubah password</h3>
            <div className="mt-4 grid gap-4">
              <input type="password" placeholder="Password lama" value={password.oldPassword} onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              <input type="password" placeholder="Password baru" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
              <input type="password" placeholder="Konfirmasi password baru" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/alamat" className="rounded-full bg-primarySoft px-4 py-2 font-semibold text-primary">Kelola alamat</Link>
            <button onClick={logout} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600">Keluar</button>
            <button onClick={() => setShowDeleteAccount(true)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600">Hapus akun</button>
          </div>
        </div>
      </div>
      <Modal open={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} label="Konfirmasi hapus akun">
        <h2 className="text-xl font-extrabold text-ink">Hapus akun?</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">Akun simulasi ini akan dikeluarkan dari perangkat ini. Anda dapat masuk kembali jika masih memiliki data akun.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowDeleteAccount(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Kembali</button>
          <button onClick={logout} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">Keluar dan hapus sesi</button>
        </div>
      </Modal>
    </Container>
  )
}

function AddressesPage() {
  usePageTitle('Alamat')
  const [addresses, setAddresses] = useState(readAddresses())
  const [form, setForm] = useState({ label: 'Rumah', recipient: '', phone: '', address: '', city: '', postal: '', note: '' })
  const [toast, showToast] = useToast()
  const [addressToDelete, setAddressToDelete] = useState(null)

  const addAddress = (e) => {
    e.preventDefault()
    const next = [...addresses, { ...form, id: `addr-${Date.now()}`, primary: false }]
    setAddresses(next)
    saveAddresses(next)
    showToast('Alamat baru berhasil disimpan.')
    setForm({ label: 'Rumah', recipient: '', phone: '', address: '', city: '', postal: '', note: '' })
  }

  const removeAddress = () => {
    if (!addressToDelete) return
    const next = addresses.filter((address) => address.id !== addressToDelete.id)
    setAddresses(next)
    saveAddresses(next)
    setAddressToDelete(null)
    showToast('Alamat berhasil dihapus.')
  }

  return (
    <Container className="py-10">
      <Toast message={toast} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-extrabold text-ink">Kelola alamat</h2>
          <div className="mt-5 space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-[22px] border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-ink">{address.label}</div>
                  {address.primary && <span className="rounded-full bg-primarySoft px-2 py-1 text-[10px] font-bold text-primary">Utama</span>}
                </div>
                <div className="mt-2 text-sm text-slate-600">{address.recipient} · {address.phone}</div>
                <div className="text-sm text-slate-600">{address.address}, {address.city}, {address.postal}</div>
                <div className="mt-3 flex gap-3">
                  <button className="rounded-full bg-primarySoft px-3 py-2 text-sm font-semibold text-primary">Jadikan utama</button>
                  <button onClick={() => setAddressToDelete(address)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-ink">Tambah alamat baru</h3>
          <form onSubmit={addAddress} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary">
                <option>Rumah</option>
                <option>Kantor</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nama penerima</label>
              <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Kota</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Alamat lengkap</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Kode pos</label>
              <input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Patokan</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            </div>
            <button type="submit" className="md:col-span-2 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white">Simpan alamat</button>
          </form>
        </div>
      </div>
      <Modal open={Boolean(addressToDelete)} onClose={() => setAddressToDelete(null)} label="Konfirmasi hapus alamat">
        <h2 className="text-xl font-extrabold text-ink">Hapus alamat ini?</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">{addressToDelete?.label}: {addressToDelete?.address}, {addressToDelete?.city}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setAddressToDelete(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Kembali</button>
          <button onClick={removeAddress} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">Hapus alamat</button>
        </div>
      </Modal>
    </Container>
  )
}

function NotFoundPage() {
  usePageTitle('Halaman Tidak Ditemukan')
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
        <div className="text-6xl font-black text-primary">404</div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Halaman tidak ditemukan</h1>
        <Link to="/" className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-white">Kembali ke beranda</Link>
    </div>
    </Container>
  )
}

function OrderNotFoundPage() {
  usePageTitle('Pesanan Tidak Ditemukan')
  const navigate = useNavigate()
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primarySoft text-primary"><PackageCheck size={28} /></div>
        <h1 className="text-2xl font-extrabold text-ink">Pesanan tidak ditemukan</h1>
        <p className="mt-2 text-sm text-secondary">Pesanan ini tidak tersedia atau bukan milik akun Anda.</p>
        <button onClick={() => navigate('/pesanan')} className="mt-5 rounded-full bg-primary px-5 py-3 font-semibold text-white">Kembali ke pesanan</button>
      </div>
    </Container>
  )
}

export default App
