'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

export default function Hero() {
  const targetDate = new Date('2025-09-21T00:00:00')

  const calculateTimeLeft = () => {
    const now        = Date.now()
    const timeDiff   = targetDate.getTime() - now
    const totalSecs  = Math.max(0, Math.floor(timeDiff / 1000))

    const days    = Math.floor(totalSecs / 86_400)
    const hours   = Math.floor((totalSecs % 86_400) / 3_600)
    const minutes = Math.floor((totalSecs % 3_600) / 60)
    const seconds = totalSecs % 60

    return { days, hours, minutes, seconds }
  }

  const [timeLeft,      setTimeLeft]      = useState(calculateTimeLeft())
  const [counterValue,  setCounterValue]  = useState(0)
  const  counterRef                       = useRef<HTMLDivElement | null>(null)

  /* live countdown */
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  /* animated ₹100 000 counter */
  useEffect(() => {
    const startValue = 0
    const endValue   = 100_000
    const duration   = 1500

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animateCounter = (startTime: number) => {
      const update = (timestamp: number) => {
        const elapsed   = timestamp - startTime
        const progress  = Math.min(elapsed / duration, 1)
        const eased     = easeOutCubic(progress)
        const value     = Math.floor(startValue + (endValue - startValue) * eased)
        setCounterValue(value)

        if (elapsed < duration) requestAnimationFrame(update)
      }
      requestAnimationFrame(update)
    }

    /** start only when visible */
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && animateCounter(performance.now())),
      { threshold: 0.5 }
    )

    if (counterRef.current) observer.observe(counterRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="home"
      className="relative lg:h-screen scroll-mt-24 flex flex-col justify-between bg-primary text-neutral-white"
    >
      {/* ── Top: two-column layout ───────────────────────── */}
      <div className="flex flex-col justify-center lg:flex-row flex-grow overflow-hidden">
        {/* Left 60 % */}
        <motion.div
          className="lg:w-[60%] w-full flex flex-col justify-center items-center bg-primary relative px-6 py-5 "
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1,  x:   0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute w-72 h-72 bg-accent/20 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />

          <div className="z-10 w-full flex flex-col gap-6 items-center ">
            <div className="text-neutral-white text-md md:text-2xl pt-8 lg:pt-0 font-bold leading-relaxed space-y-2 text-center">
              <p>PSG COLLEGE OF TECHNOLOGY</p>
              <p>COMPUTER APPLICATIONS ASSOCIATION</p>
              <p className="text-gradient pt-4 text-sm md:text-lg">Proudly Present</p>
            </div>

            <div className="flex sm:flex-row items-center gap-3 sm:gap-6 mt-4 mb-6">
              <Image
                src="/logo.png"
                alt="Logo"
                width={500}
                height={250}
                sizes="(max-width: 640px) 150px,
                       (max-width: 768px) 200px,
                       250px"
                className="w-40 sm:w-52 md:w-64 lg:w-[85%] xl:w-80 h-auto object-contain"
              />
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient">
                2025
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right 40 % */}
        <motion.div
          className="
            lg:w-[40%] w-full lg:bg-primary flex flex-col justify-center items-center relative px-6 py-5"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1,  x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-10 z-0" />

          <div className="z-10 text-center flex flex-col  md:gap-2 items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-accent-cyan mb-2">
              Cash Prize&nbsp;Worth
            </h2>

            <div
              ref={counterRef}
              className="text-4xl md:text-6xl font-extrabold text-gradient mb-6"
            >
              ₹&nbsp;{counterValue.toLocaleString('en-IN')}
            </div>

            <h2 className="text-xl pt-6 font-bold text-gradient-1 mb-4">Countdown&nbsp;Begins</h2>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {(['Days', 'Hours', 'Minutes', 'Seconds'] as const).map((label, i) => (
                <TimeBox key={label} label={label} value={Object.values(timeLeft)[i]} />
              ))}
            </div>

            <div className="flex justify-center gap-6">
              <StatBox label="Events"        value="10+"  />
              <StatBox label="Participants"  value="500+" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom subtitle ──────────────────────────────── */}
      <motion.div
        className="mx-auto mt-6 mb-4 font-montserrat"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="text-sm px-1 md:text-xl text-gradient-1 font-bold pb-4 text-center">
          International Inter-Collegiate Tech-Symposium for PG&nbsp;Students
        </p>
        <p className="text-sm px-1 md:text-lg font-medium pb-8 text-center">
          <span className="text-accent-cyan font-bold">Note:&nbsp;</span>
          <span className="text-gradient font-bold">
            Only M.E., MCA, M.Sc., M.Tech., M.Com., and M.A. students can register and participate.
          </span>
        </p>
      </motion.div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/* Helper sub-components                                      */

const TimeBox = ({ label, value }: { label: string; value: number }) => (
  <div
    className="
      flex flex-col items-center p-3 rounded-b-lg shadow backdrop-blur
      bg-gradient-to-b from-accent/60 to-transparent
      border-t-4 border-accent
    "
  >
    <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
    <span className="text-xs text-accent-cyan uppercase mt-1">{label}</span>
  </div>
)

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-gradient">{value}</p>
    <p className="text-sm text-slate-400 uppercase">{label}</p>
  </div>
)
