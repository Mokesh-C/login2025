'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, Calendar, Users, LogIn } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type NavItem =
  | { id: 'home'; label: string; icon: React.ComponentType<any>; href?: never }
  | { id: 'events' | 'timeline'|'profile' | 'teams'; label: string; icon: React.ComponentType<any>; href: string }

const navItems: NavItem[] = [
  { id: 'home',     label: 'Home',     icon: Home },
  { id: 'events',   label: 'Events',   icon: Calendar, href: '/events' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, href: '/timeline' },
  { id: 'teams',    label: 'Teams',    icon: Users,    href: '/teams' },
  { id: 'profile',    label: 'profile',    icon: Users,    href: '/profile' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()

  /* ── Home-button behaviour ────────────────────────────── */
  const scrollHome = () => {
    if (pathname === '/') {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push('/#home')
    }
  }

  /* ── active-link helper ───────────────────────────────── */
  const isActive = (item: NavItem) =>
    item.id === 'home' ? pathname === '/' : pathname.startsWith(item.href!)

  /* ── shared styles ────────────────────────────────────── */
  const base     =
    'relative flex items-center gap-2 px-3 py-2 rounded-t-md transition-colors duration-300'
  const active   =
    'bg-gradient-to-t from-accent/60 to-transparent text-neutral-white font-semibold border-b-4 border-violet-400'
  const inactive =
    'text-neutral-muted hover:text-neutral-white'

  return (
    <header
      className="
        fixed top-0 w-full z-50
        backdrop-blur-lg shadow-md
        bg-background/90 dark:bg-background-dark/90
        text-neutral-white
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-ui">
        {/* ───────── Desktop bar ───────── */}
        <div className="flex items-center justify-between h-20">
          {/* logo / home */}
          <button onClick={scrollHome} className="flex items-center gap-2">
            <Image src="/PSGCTlogo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold tracking-wide">
              PSG&nbsp;College&nbsp;of&nbsp;Technology
            </span>
          </button>

          {/* desktop nav */}
          <nav className="hidden lg:flex flex-1 justify-center font-montserrat gap-6">
            {navItems.map((item) =>
              item.id === 'home' ? (
                <button
                  key={item.id}
                  onClick={scrollHome}
                  className={`${base} ${isActive(item) ? active : inactive}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${base} ${isActive(item) ? active : inactive}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* auth buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/login"
              className="flex items-center gap-2 hover:text-accent-cyan font-medium"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              href="/register"
              className="
                bg-accent hover:bg-accent-hover
                text-neutral-white font-semibold
                px-4 py-2 rounded-b-md
                border-t-4 border-violet-400
              "
            >
              Register&nbsp;Now
            </Link>
          </div>

          {/* hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ───────── Mobile drawer ───────── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/40 lg:hidden z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />

              {/* slide-in drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                className="
                  fixed top-0 right-0 h-screen w-64 z-50 flex flex-col pt-24 px-6 gap-6
                  bg-primary-80 backdrop-blur-2xl
                  border-l border-white/10 shadow-lg
                "
              >
                {/* close btn */}
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-md hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                {navItems.map((item) =>
                  item.id === 'home' ? (
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollHome()
                        setMobileOpen(false)
                      }}
                      className={`${base} ${isActive(item) ? active : ''}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`${base} ${isActive(item) ? active : ''}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                )}

                {/* auth (mobile) */}
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 hover:text-accent-cyan font-bold"
                >
                  <LogIn className="w-5 h-5" /> Login
                </Link>
                <Link
                  href="/register"
                  className="bg-accent text-neutral-white text-center px-4 py-2 rounded"
                >
                  Register&nbsp;Now
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
