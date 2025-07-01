'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  /* ── COUNTDOWN LOGIC ───────────────────────── */
  const targetDate = new Date('2025-09-21T00:00:00')

  const calcTimeLeft = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now())
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    }
  }

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft())
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  /* ── PRIZE COUNTER LOGIC (ease-out cubic, repeatable) ───── */
  const [prize, setPrize] = useState(0)
  const prizeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const duration = 1500
    const startValue = prize
    const endValue = 100000

    const animateCounter = (startTime: number) => {
      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const value = Math.floor(startValue + (endValue - startValue) * eased)
        setPrize(value)
        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          setPrize(endValue)
        }
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrize(0) // reset
          animateCounter(performance.now())
        }
      },
      { threshold: 0.5 }
    )

    if (prizeRef.current) observer.observe(prizeRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── MARKUP ─────────────────────────────────── */
  return (
    <>
      {/* ───────── HERO (TOP) ───────── */}
      <section className="flex flex-col lg:flex-row  text-neutral-white lg:min-h-[calc(100vh-5rem)]">
        <div className="container mx-auto flex flex-col lg:flex-row w-full px-6 py-5">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative lg:w-[60%] w-full flex flex-col items-center justify-center"
          >
            <div className="absolute w-72 h-72 bg-accent/20 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="z-10 flex flex-col items-center gap-10">
              <div className="flex items-center gap-1 md:gap-4">
                <Image src="/PSGCTlogo.png" alt="PSG Crest" width={40} height={40} />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                    PSG COLLEGE OF TECHNOLOGY
                  </p>
                  <p className="text-gray-300 font-bold text-xs sm:text-sm md:text-base">
                    Computer Applications Association
                  </p>
                </div>
              </div>
              <p className="text-gradient font-bold text-sm md:text-lg">Proudly Presents</p>
              <div className="flex items-center gap-3 sm:gap-6">
                <Image
                  src="/logo.png"
                  alt="Login Logo"
                  width={480}
                  height={240}
                  className="w-60 sm:w-72 md:w-80 lg:w-[28rem]"
                />
                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gradient">
                  2025
                </span>
              </div>
              <p className="italic font-semibold text-gradient text-sm md:text-xl -mt-4 text-center">
                The perfect fusion of Masterminds
              </p>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-[40%] w-full mt-10 lg:mt-0 flex flex-col justify-center items-center text-center"
          >
            <div className="flex flex-col gap-10 max-w-md">
              <div className="flex flex-col gap-3">
                <p className="text-4xl font-bold font-satoshi text-gradient p-2">
                  September&nbsp;21, 22
                </p>
                <h3 className="text-base text-gray-300 sm:text-lg">
                  Experience the 34<sup>th</sup> International Inter‑Collegiate Tech‑Symposium
                  where innovation meets reality in the digital realm.
                </h3>
              </div>
              <div className="flex justify-around font-extrabold text-2xl text-gradient-1">
                <div>
                  <p>
                    10<span className="text-purple-500">+</span>
                  </p>
                  <p className="text-sm font-medium text-slate-300">EVENTS</p>
                </div>
                <div>
                  <p>
                    500<span className="text-purple-500">+</span>
                  </p>
                  <p className="text-sm font-medium text-slate-300">PARTICIPANTS</p>
                </div>
              </div>
            </div>
            <div className="pt-10 flex gap-6">
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md font-semibold shadow transition"
              >
                Register
              </Link>
              <Link
                href="/events"
                className="border-2 border-accent text-gradient px-5 py-2 rounded-md
        font-semibold shadow transition-colors
        hover:bg-violet-500 hover:text-white"
              >
                Explore Events <span className="text-xl">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── PRIZE‑POOL (BOTTOM) ───────── */}
      <section
        ref={prizeRef}
        className="relative min-h-[60vh] flex flex-col items-center justify-center  text-white overflow-hidden px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 text-center max-w-3xl"
        >
          <h1 className="leading-tight font-extrabold text-gray-300 text-4xl sm:text-5xl md:text-6xl">
            CASH PRIZE WORTH <br />
            <span className="text-gradient">
              ₹ {prize.toLocaleString('en-IN')}
            </span>
          </h1>

          <div className="mt-6 flex flex-wrap justify-center gap-4 font-semibold text-xl">
            <TimeBox label="DAYS" value={timeLeft.days} />
            <TimeBox label="HRS" value={timeLeft.hours} />
            <TimeBox label="MIN" value={timeLeft.minutes} />
            <TimeBox label="SEC" value={timeLeft.seconds} />
          </div>

          <div className="pb-8">
            <p className="mt-10 text-gradient-1 text-lg sm:text-xl font-medium">
              International Inter‑Collegiate Tech‑Symposium for PG Students
            </p>
            <p className="mt-2 text-gradient sm:text-lg">
              <span className="text-accent-cyan font-semibold">Note:</span>{' '}
              Only M.E., MCA, MBA, M.Sc., M.Tech., M.Com., and M.A. students can register and participate.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  )
}

/* Utility for countdown squares */
const TimeBox = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center bg-gradient-to-b from-accent/60 to-transparent text-neutral-white font-semibold border-t-4 border-violet-500 px-5 py-2 ">
    <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
    <span className="text-xs uppercase mt-1 text-accent-cyan">{label}</span>
  </div>
)
