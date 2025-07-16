'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const SPONSORS = [
  { name: 'Arcesium', logo: '/sponsors/ARCESIUM.png' },
  { name: 'Annapoorna', logo: '/sponsors/ANNAPOORNA.png' },
  { name: 'KLA', logo: '/sponsors/KLA.png' },
  { name: 'Drunken Monkey', logo: '/sponsors/DrunkenMonkey.png' },
  { name: 'ABS', logo: '/sponsors/ABS.png' },
]

const mod = (n: number, m: number) => ((n % m) + m) % m

export default function OurSponsors() {
  const [view, setView] = useState(0)
  const [side, setSide] = useState(0)
  const [vert, setVert] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 640
      setVert(mobile)
      if (!wrapRef.current) return
      const w = wrapRef.current.offsetWidth
      const len = mobile ? w * 0.5 : w / 3 // Three cards on non-mobile
      setSide(len)
      wrapRef.current.style.height = mobile ? `${len * 3}px` : 'auto'
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const id = setInterval(() => move(view + 1), 3000)
    return () => clearInterval(id)
  }, [view, vert])

  const slides = [SPONSORS.at(-1)!, ...SPONSORS, SPONSORS[0]]
  const real = mod(view, SPONSORS.length)
  const delta = -((view + 1) * side - side)
  const trans = vert ? `translateY(${delta}px)` : `translateX(${delta}px)`

  const move = (to: number) => {
    if (!trackRef.current) return
    trackRef.current.style.transition = 'transform 0.35s cubic-bezier(.4,1,.4,1)'
    setView(to)
  }

  const onEnd = () => {
    if (!trackRef.current) return
    if (view === -1 || view === SPONSORS.length) {
      const to = view === -1 ? SPONSORS.length - 1 : 0
      const jump = -((to + 1) * side - side)
      trackRef.current.style.transition = 'none'
      trackRef.current.style.transform = vert
        ? `translateY(${jump}px)`
        : `translateX(${jump}px)`
      trackRef.current.getBoundingClientRect()
      trackRef.current.style.transition = 'transform 0.35s cubic-bezier(.4,1,.4,1)'
      setView(to)
    }
  }

  return (
    <section className="w-full min-h-[calc(100vh-5rem)] bg-gradient-to-br from-primary via-primary-100 to-primary text-white overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-8 sm:mt-10 mb-2"
      >
        Our Sponsors
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-base sm:text-lg md:text-xl text-gradient text-center mb-8 sm:mb-10 font-medium"
      >
        Thank you to our amazing sponsors!
      </motion.p>

      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden px-2 sm:px-4"
        style={{ maxWidth: '95%', margin: '0 auto' }}
      >
        <div
          ref={trackRef}
          className={`flex ${vert && 'flex-col'}`}
          style={{
            width: vert ? '100%' : slides.length * side,
            height: vert ? slides.length * side : 'auto',
            transform: trans,
            transition: 'transform 0.35s cubic-bezier(.4,1,.4,1)',
          }}
          onTransitionEnd={onEnd}
        >
          {slides.map((s, i) => {
            const realIdx = mod(i - 1, SPONSORS.length)
            const focused = realIdx === real
            return (
              <motion.div
                key={i + s.name}
                style={{
                  width: vert ? '100%' : side,
                  height: vert ? side : '20rem',
                }}
                className={`flex flex-col items-center justify-center px-2 sm:px-3 ${
                  focused ? 'z-10' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`transparent p-3 sm:p-4   max-w-[16rem] sm:max-w-[20rem] h-full max-h-[16rem] sm:max-h-[20rem] flex items-center justify-center ${
                    focused
                      ? 'scale-110'
                      : 'scale-90 opacity-60'
                  }`}
                >
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={200}
                    height={200}
                    unoptimized
                    className="object-contain h-full w-full"
                  />
                </motion.div>
                { (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base sm:text-lg font-medium"
                  >
                    {s.name}
                  </motion.p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center mt-6 sm:mt-8 gap-2 sm:gap-3">
        {SPONSORS.map((_, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            aria-label={`Go to sponsor ${SPONSORS[i].name}`}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
              real === i ? 'bg-white scale-125' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}