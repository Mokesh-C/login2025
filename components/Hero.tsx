'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

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
  const [showConfetti, setShowConfetti] = useState(false)

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
          setShowConfetti(true) // Trigger confetti once when target is reached
        }
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrize(0) // reset
          animateCounter(performance.now())
          setShowConfetti(false) // Reset confetti on new animation
        }
      },
      { threshold: 0.5 }
    )

    if (prizeRef.current) observer.observe(prizeRef.current)
    return () => observer.disconnect()
  }, [])

    
    
  // Canvas-confetti animation with faster gravity and div bounds
useEffect(() => {
  if (showConfetti) {
    // Get the prize section bounds
    const prizeSection = document.querySelector('#cash-prize-text');
    if (!prizeSection) return;
    
    const rect = prizeSection.getBoundingClientRect();
    // Calculate origin relative to viewport
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    // First burst - faster falling with gravity
    confetti({
      particleCount: 100,
      spread: 70,
      startVelocity: 40,
      origin: { x, y }, // center of prize section
      shapes: ['circle', 'square'],
      colors: [
        '#f9f871', '#72efdd', '#ff61a6', '#ffd166', '#7aecb3',
        '#a2d2ff', '#bdb2ff', '#ffc6ff', '#ffafcc', '#43aa8b',
        '#577590', '#fee440', '#7209b7'
      ],
      scalar: 1.2,
      gravity: 5, // Faster falling (default is 1)
      drift: 0.1,
      ticks: 100 // Shorter duration (default is 200)
    });
    
    // Second burst
    setTimeout(() => {
      // First burst
confetti({
  particleCount: 100,
  spread: 70,
  startVelocity: 40,
  origin: { x, y },
  shapes: [
    'circle', 
    'square', 
    confetti.shapeFromText({ text: '▲', scalar: 2 }), // Triangle
    confetti.shapeFromText({ text: '|', scalar: 3 })  // Line
  ],
  colors: [
    '#f9f871', '#72efdd', '#ff61a6', '#ffd166', '#7aecb3',
    '#a2d2ff', '#bdb2ff', '#ffc6ff', '#ffafcc', '#43aa8b',
    '#577590', '#fee440', '#7209b7'
  ],
  scalar: 1.2,
  gravity: 3,
  drift: 0.1,
  ticks: 80
});

// Second burst  
confetti({
  particleCount: 60,
  spread: 100,
  startVelocity: 30,
  origin: { x, y },
  shapes: [
    'circle', 
    'square',
    confetti.shapeFromText({ text: '▲', scalar: 2 }), // Triangle
    confetti.shapeFromText({ text: '|', scalar: 3 })  // Line
  ],
  colors: [
    '#fdffb6', '#caff70', '#ffc6ff', '#90ee90',
    '#ff9671', '#fa7e1e', '#e63946'
  ],
  scalar: 1.0,
  gravity: 3,
  drift: 0.1,
  ticks: 80
});
    }, 200);
    
    // Reset confetti state after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 1500); // Reduced from 3000ms to 1500ms
  }
}, [showConfetti])


  /* ── MARKUP ─────────────────────────────────── */
  return (
    <>
      {/* ───────── HERO (TOP) ───────── */}
      <section className="flex flex-col lg:flex-row text-neutral-white lg:min-h-[calc(100vh-5rem)]">
        <div className="container mx-auto flex flex-col lg:flex-row w-full px-6 py-5">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
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
                  width={880}
                  height={240}
                  className="w-60 sm:w-72 md:w-80 lg:w-[38rem]"
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-[40%] w-full mt-10 lg:mt-0 flex flex-col justify-center items-center text-center"
          >
            <div className="flex flex-col gap-10 max-w-md">
              <div className="flex flex-col gap-3">
                <p className="text-4xl font-bold font-satoshi text-gradient p-2">
                  September 20, 21
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
                href="/register/alumini"
                className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md font-semibold shadow transition"
              >
                Alumni Registration
              </Link>
              <Link
                href="/events"
                className="border-2 border-accent text-gradient px-5 py-2 rounded-md
        font-semibold shadow transition-colors
        hover:bg-violet-500 hover:text-white"
              >
                Explore Events <span className="text-xl">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── PRIZE‑POOL (BOTTOM) ───────── */}
      <section
        ref={prizeRef}
        id="prize-section"
        className="relative min-h-[60vh] flex flex-col items-center justify-center text-white overflow-hidden px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 text-center max-w-3xl"
        >
          <p className="leading-tight font-extrabold text-gray-300 text-2xl sm:text-5xl md:text-6xl">
            CASH PRIZE WORTH
          </p>
          <h1 id="cash-prize-text" className="text-gradient-1 font-extrabold py-4 text-4xl sm:text-5xl md:text-6xl">
            ₹ {prize.toLocaleString('en-IN')}
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
              Only M.E., M.Tech., MBA, MCA, M.Sc., and other PG students can register and participate.
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