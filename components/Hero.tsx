'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

export default function Hero() {
  // COUNTDOWN LOGIC
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

  // PRIZE COUNTER LOGIC (run only once)
  const [prize, setPrize] = useState(Math.floor(Math.random() * 100000))
  const prizeRef = useRef<HTMLDivElement | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)  
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prizeSectionInView, setPrizeSectionInView] = useState(false);

useEffect(() => {
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const duration = 1500;
  const startValue = 0;
  const endValue = 100000;

  const animateCounter = () => {
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = Math.floor(startValue + (endValue - startValue) * eased);
      setPrize(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setPrize(endValue);
        setShowConfetti(true);
        setHasAnimated(true); // Mark animation done
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setPrize(0);
        animateCounter();
        setShowConfetti(false);
      }
    },
    { threshold: 0.5 }
  );

  if (prizeRef.current) observer.observe(prizeRef.current);
  return () => observer.disconnect();
}, [hasAnimated]);

  // Intersection Observer for prize section animation
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrizeSectionInView(true);
        }
      },
      { threshold: 0.4 }
    );
    if (prizeRef.current) observer.observe(prizeRef.current);
    return () => observer.disconnect();
  }, []);


  // Confetti burst (same as before)
  useEffect(() => {
    if (showConfetti) {
      const prizeSection = document.querySelector('#cash-prize-text')
      if (!prizeSection) return
      const rect = prizeSection.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      confetti({
        particleCount: 100,
        spread: 70,
        startVelocity: 40,
        origin: { x, y },
        shapes: ['circle', 'square'],
        colors: [
          '#f9f871', '#72efdd', '#ff61a6', '#ffd166', '#7aecb3',
          '#a2d2ff', '#bdb2ff', '#ffc6ff', '#ffafcc', '#43aa8b',
          '#577590', '#fee440', '#7209b7'
        ],
        scalar: 1.2,
        gravity: 5,
        drift: 0.1,
        ticks: 100
      })
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          startVelocity: 40,
          origin: { x, y },
          shapes: [
            'circle',
            'square',
            confetti.shapeFromText({ text: '▲', scalar: 2 }),
            confetti.shapeFromText({ text: '|', scalar: 3 })
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
        })
        confetti({
          particleCount: 60,
          spread: 100,
          startVelocity: 30,
          origin: { x, y },
          shapes: [
            'circle',
            'square',
            confetti.shapeFromText({ text: '▲', scalar: 2 }),
            confetti.shapeFromText({ text: '|', scalar: 3 })
          ],
          colors: [
            '#fdffb6', '#caff70', '#ffc6ff', '#90ee90',
            '#ff9671', '#fa7e1e', '#e63946'
          ],
          scalar: 1.0,
          gravity: 3,
          drift: 0.1,
          ticks: 80
        })
      }, 200)
      setTimeout(() => {
        setShowConfetti(false)
      }, 1500)
    }
  }, [showConfetti])

  // MARKUP
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative flex flex-col sm:justify-center min-h-[calc(100vh-5rem)] w-full overflow-hidden px-4 md:px-12 lg:px-24 pb-0">
        {/* Decorative Mountain Wave at Bottom */}
        <div className="absolute bottom-0 left-0 w-full ">
          {/* Main mountain wave */}
          <svg viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path fill="#a2d2ff" fillOpacity="0.12" d="M0,120L60,128C120,136,240,152,360,148C480,144,600,120,720,100C840,80,960,64,1080,76C1200,88,1320,128,1380,148L1440,168L1440,180L1380,180C1320,180,1200,180,1080,180C960,180,840,180,720,180C600,180,480,180,360,180C240,180,120,180,60,180L0,180Z" />
          </svg>
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-5 md:gap-10 pb-12 h-full"
        >
          {/* Left: Logo, College Name, Association, Presents, Event Image */}
          <div className="flex flex-col items-center  pt-8 sm:pt-0  md:items-start text-center md:text-left gap-2 sm:gap-4 md:w-[65%]">
            <div className="flex flex-row items-center justify-center gap-2 md:gap-4 w-full">
              <Image src="/PSGCTlogo.png" alt="PSG LOGO" width={35} height={35} className="sm:min-w-[50px] sm:min-h-[50px] md:min-w-[50px] md:min-h-[50px]" />
              <div className="flex flex-col items-start md:items-center">
                <p className="font-bold text-base sm:text-xl md:text-2xl lg:text-3xl text-white leading-tight">PSG COLLEGE OF TECHNOLOGY</p>
                <p className="text-gray-300 font-bold sm:p-2 text-sm sm:text-base md:text-lg lg:text-xl leading-tight">Computer Applications Association</p>
              </div>
            </div>
            <p className="text-gradient w-full text-center font-bold text-base sm:text-xl md:text-2xl lg:text-[1.5rem] mt-4">Proudly Presents</p>
            <Image
              src="/logo.png"
              alt="Login Logo"
              width={600}
              height={200}
              className="w-80 sm:w-[28rem] md:w-[34rem] lg:w-[40rem]"
            />
          </div>
          {/* Right: Date, Description, Stats, Buttons */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-6 md:w-[35%] max-w-lg justify-center p-2">
            <span className="text-gradient-1 font-extrabold text-2xl sm:text-3xl md:text-3xl lg:text-4xl">September 20, 21</span>
            <span className="text-gray-200 text-justify text-base md:text-lg lg:text-xl mt-2 max-w-md px-2">Experience the 34<sup>th</sup> National Level Inter-Collegiate Tech-Symposium where innovation meets reality in the digital realm.</span>
            <div className="flex flex-row gap-6 md:gap-8 justify-center md:justify-start mt-2">
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold text-gradient-1">10+</span>
                <span className="text-sm md:text-base font-medium text-slate-300">EVENTS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold text-gradient-1">500+</span>
                <span className="text-sm md:text-base font-medium text-slate-300">PARTICIPANTS</span>
              </div>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-4 md:gap-6 mt-2 justify-center md:justify-start">
              <Link
                href="/register/alumini"
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-md font-semibold shadow transition"
              >
                Alumni Registration
              </Link>
              <Link
                href="/events"
                className="border-2 border-accent text-violet-500 px-6 py-3 rounded-md font-semibold shadow transition-colors hover:bg-violet/10 hover:text-white/80 hover:border-violet-400 "
              >
                Explore Events <span className="text-lg font-bold">→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
      {/* PRIZE SECTION */}
      <section
        ref={prizeRef}
        id="prize-section"
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-white overflow-hidden px-4"
      >
        <motion.div
          initial={{ y: 60 }}
          animate={prizeSectionInView ? { y: 0 } : { y: 60 }}
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

const TimeBox = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center bg-gradient-to-b from-accent/60 to-transparent text-neutral-white font-semibold border-t-4 border-violet-500 px-4 py-1 ">
    <span className="text-xl font-bold">{value.toString().padStart(2, '0')}</span>
    <span className="text-xs uppercase mt-1 text-accent-cyan">{label}</span>
  </div>
)