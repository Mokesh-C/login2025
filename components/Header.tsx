'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, Calendar, Clock, Users, Handshake, GraduationCap, LogIn, ChevronRight, User, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import useAuth from '@/hooks/useAuth';

type NavItem = 
  | { id: 'home'; label: string; icon: React.ComponentType<any>; href?: never }
  | { id: 'events' | 'timeline' | 'teams' | 'sponsors' | 'alumni'; label: string; icon: React.ComponentType<any>; href: string }

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'events', label: 'Events', icon: Calendar, href: '/events' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/timeline' },
  { id: 'teams', label: 'Teams', icon: Users, href: '/teams' },
  { id: 'sponsors', label: 'Sponsors', icon: Handshake, href: '/sponsors' },
  { id: 'alumni', label: 'Our Alumni', icon: GraduationCap, href: '/alumni' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth();

  // Check for JWT token and user role in localStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('refreshToken')
      const role = localStorage.getItem('userRole')
      setIsLoggedIn(!!token)
      setUserRole(role)
    }
    checkLoginStatus() // Initial check
    window.addEventListener('storageChange', checkLoginStatus)
    return () => window.removeEventListener('storageChange', checkLoginStatus)
  }, [])

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    await logout(refreshToken);  
    setIsLoggedIn(false);
    setUserRole(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('storageChange'));
    router.push('/');
  }

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
  const base = 'relative flex items-center gap-2 px-2 py-2 rounded-t-md transition-colors duration-300'
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
          bg-gradient-to-br from-accent-first via-accent-second to-accent-third
          backdrop-blur-lg shadow-md
          text-neutral-white
          transition-all duration-300
          ${isScrolled ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}
          h-20
        `}
      >
        <div className="w-full xl:max-w-[95%] mx-auto px-5 sm:px-6 lg:px-8 font-ui flex items-center justify-between h-full">
          <button onClick={scrollHome} className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wide lg:text-xl lg:font-bold lg:tracking-wide hidden sm:inline px-2">
              LOGIN 2025
            </span>
            <span className="text-xl pl-2 font-bold tracking-wide sm:hidden">
              LOGIN 2025
            </span>
          </button>
          <nav className="hidden lg:flex flex-1 justify-center font-montserrat gap-2 xl:gap-8">
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
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-300/10 hover:bg-blue-300/20 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-blue-300/10 backdrop-blur-xl rounded-md shadow-lg border border-blue-300/10"
                    >
                      <Link
                        href={userRole === 'alumni' ? '/profile/alumni' : '/profile'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-300/20"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-blue-300/20"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
                          ) : (
                <Link href="/login" className="flex items-center gap-2 hover:text-accent-cyan bg-accent hover:bg-accent-hover text-neutral-white font-medium px-4 py-2 rounded-b-md border-t-4 border-violet-400">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              )}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 lg:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed top-0 left-0 h-screen w-64 z-50 flex flex-col pt-24 px-6 gap-6 bg-gradient-to-br from-brand-purple via-follow-pink to-brand-cyan backdrop-blur-2xl border-r border-blue-300/10 shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-5">
                <h1 className="text-xl font-extrabold tracking-wide select-none">
                  LOGIN 2025
                </h1>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-md hover:bg-blue-300/10"
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
              {isLoggedIn ? (
                <>
                  <Link
                    href={userRole === 'alumni' ? '/profile/alumni' : '/profile'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 hover:text-accent-cyan font-bold"
                  >
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 hover:text-accent-cyan font-bold"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 hover:text-accent-cyan font-bold">
                  <LogIn className="w-5 h-5" /> Login
                </Link>
              )}
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
            ? 'w-[95%] p-[2px] rounded-lg bg-gradient-to-r from-stale-950/[0.2] to-violet-950/[0.05] via-80% backdrop-blur-2xl border sm:border-2 border-violet-50/[0.2]'
            : 'max-w-7xl w-full'
        )}>
          <div className={clsx(
            'flex items-center justify-between',
            isScrolled ? 'h-12 sm:h-16 bg-gradient-to-r from-stale-950/[0.2] to-violet-950/[0.05] via-80% backdrop-blur-2xl rounded-[inherit] px-6' : 'h-16 sm:h-20 px-4 sm:px-6 lg:px-8'
          )}>
            <button onClick={scrollHome} className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wide lg:text-xl lg:font-bold lg:tracking-wide hidden sm:inline px-2">
                LOGIN 2025
              </span>
              <span className="text-xl pl-2 font-bold tracking-wide sm:hidden">
                LOGIN 2025
              </span>
            </button>
            <nav className="hidden lg:flex flex-1 justify-center font-montserrat xl:gap-5">
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
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-300/10 hover:bg-blue-300/20 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-blue-300/10 backdrop-blur-xl rounded-md shadow-lg border border-blue-300/10"
                      >
                        <Link
                          href={userRole === 'alumni' ? '/profile/alumni' : '/profile'}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-300/20"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-blue-300/20"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 hover:text-accent-cyan font-medium bg-accent hover:bg-accent-hover text-neutral-white px-4 py-2 rounded-b-md border-t-4 border-violet-400">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              )}
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