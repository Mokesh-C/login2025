'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, Calendar, Users, LogIn, ChevronRight  } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

type NavItem = 
  | { id: 'home'; label: string; icon: React.ComponentType<any>; href?: never }
  | { id: 'events' | 'timeline' | 'teams' | 'sponsors'; label: string; icon: React.ComponentType<any>; href: string }

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'events', label: 'Events', icon: Calendar, href: '/events' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, href: '/timeline' },
  { id: 'teams', label: 'Teams', icon: Users, href: '/teams' },
  { id: 'sponsors', label: 'Sponsors', icon: Users, href: '/sponsors' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80) // Trigger after 50px scroll
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  const base = 'relative flex items-center gap-2 px-3 py-2 rounded-t-md transition-colors duration-300'
  const active = 'bg-gradient-to-t from-accent/60 to-transparent text-neutral-white font-semibold border-b-4 border-violet-500'
  const inactive = 'text-neutral-muted hover:text-neutral-white'

  return (
    <>
          {/* Initial Header (visible before scroll, scrolls naturally) */}
          
      
      <motion.header
         initial={{ y: -80, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0 }}
        className={`
          w-full z-40
          bg-gradient-to-br  from-primary via-primary-100 to-primary
          backdrop-blur-lg shadow-md
          text-neutral-white
          transition-all duration-300
          ${isScrolled ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}
          h-20
        `}
      >
        <div className="w-full md:max-w-[95%]  mx-auto px-5 sm:px-6 lg:px-8 font-ui flex items-center justify-between h-full">
          <button onClick={scrollHome} className="flex items-center gap-2 ">
            {/* <Image src="/PSGCTlogo.png" alt="Logo" width={32} height={32} /> */}
            <span className="text-xl font-bold tracking-wide lg:text-xl lg:font-bold lg:tracking-wide hidden sm:inline">
            LOGIN 2025
              </span>
              <span className="text-xl pl-2 font-bold tracking-wide sm:hidden">
                LOGIN 2025
              </span>
          </button>
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
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login" className="flex items-center gap-2 hover:text-accent-cyan font-medium">
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              href="/register"
              className="bg-accent hover:bg-accent-hover text-neutral-white font-semibold px-4 py-2 rounded-b-md border-t-4 border-violet-400"
            >
              Register Now
            </Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer (unchanged) */}
      <AnimatePresence>
        {mobileOpen && (
            <>
            <motion.div
                className="fixed inset-0 bg-black/40 lg:hidden z-40" //-55 for back
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
            />
            <motion.div
                initial={{ x: '-100%' }} // Changed from '100%' to '-100%' to start from the left
                animate={{ x: 0 }}
                exit={{ x: '-100%' }} // Exit back to the left
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                className="fixed top-0 left-0 h-screen w-64 z-50 flex flex-col pt-24 px-6 gap-6  bg-gradient-to-br from-brand-purple via-brand-pink to-brand-cyan
    backdrop-blur-2xl  border-r border-white/10 shadow-lg" // Changed border-l to border-r
            >
                <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-5">
                    <h1 className="text-xl font-extrabold tracking-wide select-none">
                    PSGCT
                    </h1>

                    <button
                    aria-label="Close menu"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-md hover:bg-white/10"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>
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
                <Link href="/login" className="flex items-center gap-2 px-4 hover:text-accent-cyan font-bold">
                <LogIn className="w-5 h-5" /> Login
                </Link>
                <Link href="/register" className="bg-accent text-neutral-white text-center px-4 py-2 rounded">
                Register Now
                </Link>
            </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Scrolled Header (animates in on scroll, fixed with all content) */}
      <header
        className={`
          fixed ${isScrolled ? 'top-4' : 'top-0'} w-full z-50
          backdrop-blur-lg shadow-md
          text-neutral-white
          transition-all duration-300
          ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
          flex items-center
        `}
      >
        <div className={clsx(
          'mx-auto transition-all duration-300 pointer-events-auto',
          isScrolled
            ? 'max-w-[90%] w-[95%] p-[2px] rounded-lg bg-gradient-to-r from-stale-950/[0.2] to-violet-950/[0.05] via-80% backdrop-blur-2xl border sm:border-2 border-violet-50/[0.2]'
            : 'max-w-7xl w-full'
        )}>
          <div className={clsx(
            'flex items-center justify-between',
            isScrolled ? 'h-16 bg-gradient-to-r from-stale-950/[0.2] to-violet-950/[0.05] via-80% backdrop-blur-lg rounded-[inherit] px-6' : 'h-20 px-4 sm:px-6 lg:px-8'
          )}>
            <button onClick={scrollHome} className="flex items-center gap-2">
              {/* <Image src="/PSGCTlogo.png" alt="Logo" width={32} height={32} /> */}
              <span className="text-xl font-bold tracking-wide lg:text-xl lg:font-bold lg:tracking-wide hidden sm:inline">
              LOGIN 2025
              </span>
              <span className="text-xl pl-2 font-bold tracking-wide sm:hidden">
              LOGIN 2025
              </span>
            </button>
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
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login" className="flex items-center gap-2 hover:text-accent-cyan font-medium">
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-hover text-neutral-white font-semibold px-4 py-2 rounded-b-md border-t-4 border-violet-400"
              >
                Register Now
              </Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}