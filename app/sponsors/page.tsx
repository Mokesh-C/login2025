'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'           /* ← NEW */

const SPONSORS = [
  { name: 'Arcesium',       logo: '/sponsors/ARCESIUM.png'      },
  { name: 'Annapoorna',     logo: '/sponsors/ANNAPOORNA.png'    },
  { name: 'KLA',            logo: '/sponsors/KLA.png'           },
  { name: 'Drunken Monkey', logo: '/sponsors/DrunkenMonkey.png' },
  { name: 'ABS',            logo: '/sponsors/ABS.png'           },
]

const mod = (n: number, m: number) => ((n % m) + m) % m         // true modulo

export default function OurSponsors() {
  /* -------------  state & refs  ----------------------------------- */
  const [view,  setView ] = useState(0)      // track index (can be clones)
  const [side,  setSide ] = useState(0)      // card edge length (square)
  const [vert,  setVert ] = useState(false)  // mobile column?
  const wrapRef           = useRef<HTMLDivElement>(null)
  const trackRef          = useRef<HTMLDivElement>(null)

  /* -------------  measure wrapper & decide row/column  ------------ */
  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 640
      setVert(mobile)
      if (!wrapRef.current) return
      const w = wrapRef.current.offsetWidth
      const len = w / 3                      // three cards visible
      setSide(len)
      wrapRef.current.style.height = mobile ? `${len * 3}px` : 'auto'
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  /* -------------  auto‑loop  ------------------------------------- */
  useEffect(() => {
    const id = setInterval(() => move(view + 1), 3000)
    return () => clearInterval(id)
  }, [view, vert])

  /* -------------  helper values  --------------------------------- */
  const slides = [
    SPONSORS.at(-1)!, ...SPONSORS, SPONSORS[0],
  ]
  const real   = mod(view, SPONSORS.length)
  const delta  = -((view + 1) * side - side)
  const trans  = vert ? `translateY(${delta}px)` : `translateX(${delta}px)`

  /* -------------  navigation  ------------------------------------ */
  const move = (to: number) => {
    if (!trackRef.current) return
    trackRef.current.style.transition = 'transform 0.35s cubic-bezier(.4,1,.4,1)'
    setView(to)
  }

  /* -------------  seamless wrap  --------------------------------- */
  const onEnd = () => {
    if (!trackRef.current) return
    if (view === -1 || view === SPONSORS.length) {
      const to   = view === -1 ? SPONSORS.length - 1 : 0
      const jump = -((to + 1) * side - side)
      trackRef.current.style.transition = 'none'
      trackRef.current.style.transform  = vert
        ? `translateY(${jump}px)` : `translateX(${jump}px)`
      trackRef.current.getBoundingClientRect()      // flush
      trackRef.current.style.transition = 'transform 0.35s cubic-bezier(.4,1,.4,1)'
      setView(to)
    }
  }

  /* ============================  UI  ============================= */
  return (
    <section className="w-full min-h-[calc(100vh-5rem)] bg-gradient-to-br from-primary via-primary-100 to-primary text-white overflow-hidden">
      {/* ---- animated heading ---- */}
      <motion.h2
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl font-bold text-center mt-10 mb-2"
      >
        Our Sponsors
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-lg text-gradient text-center mb-10 font-medium"
      >
        Thank you to our amazing sponsors!
      </motion.p>

      {/* ---- wrapper ---- */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden"
        style={{ maxWidth: 900, margin: '0 auto' }}
      >
        <div
          ref={trackRef}
          className={`flex ${vert && 'flex-col'}`}
          style={{
            width:  vert ? '100%' : slides.length * side,
            height: vert ? slides.length * side : '100%',
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
                  width:  vert ? '100%' : side,
                  height: vert ? side : 300,
                }}
                className={`flex flex-col items-center justify-center px-4 ${
                  focused ? 'z-10' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`bg-white/10 p-4 rounded-xl shadow-lg w-48 h-48 flex items-center justify-center ${
                    focused ? 'shadow-md shadow-white/50 scale-110' : 'scale-90 opacity-60'
                  }`}
                >
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={150}
                    height={150}
                    unoptimized
                    className="object-contain h-full w-full"
                  />
                </motion.div>
                {focused && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-lg font-medium"
                  >
                    {s.name}
                  </motion.p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ---- dots ---- */}
      <div className="flex justify-center mt-8 gap-2">
        {SPONSORS.map((_, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            aria-label={`Go to sponsor ${SPONSORS[i].name}`}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              real === i ? 'bg-white scale-125' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
