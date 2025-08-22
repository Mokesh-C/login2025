'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

export default function Hero() {
  // AUTH STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // COUNTDOWN LOGIC
  const targetDate = new Date('2025-09-20T00:00:00')
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

  // AUTH STATE MANAGEMENT
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
      <section className="flex flex-col sm:justify-center min-h-[calc(100vh-5rem)] w-full overflow-hidden px-4 md:px-12 lg:px-24 pb-0 font-manrope">
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
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-3 md:w-[35%] max-w-lg justify-center p-2 font-manrope tracking-wide">
            <span className="text-gradient-1 font-extrabold text-2xl sm:text-3xl md:text-3xl lg:text-4xl">September 20, 21</span>
            <span className="text-gray-200 text-justify text-base md:text-lg lg:text-lg  max-w-md ">Experience the 34<sup>th</sup> International Inter-Collegiate Tech-Symposium where innovation meets reality in the digital realm.</span>
            <span className="text-xl md:text-lg font-semibold font-montserrat text-gradient ">
              <span className='font-bolder'>Note: </span>A Global Tech Stage Only for Postgraduate Students
            </span>
            <div className="flex flex-row gap-6 md:gap-8 justify-center md:justify-start ">
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
              {!isLoggedIn ? (
                <Link
                  href="/register"
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-md font-semibold shadow transition"
                >
                  Register
                </Link>
              ) : userRole === 'student' ? (
                <Link
                  href="/profile"
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-md font-semibold shadow transition"
                >
                  Dashboard
                </Link>
              ) : userRole === 'alumni' ? (
                <Link
                  href="/profile/alumni"
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-md font-semibold shadow transition"
                >
                  Alumni Dashboard
                </Link>
              ) : isLoggedIn && !userRole ? (
                <Link
                  href="/profile"
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-md font-semibold shadow transition"
                >
                  Dashboard
                </Link>
              ) : null}
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
        className="relative min-h-[55vh] sm:min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center text-white overflow-hidden px-4 font-manrope"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={prizeSectionInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center justify-center w-full"
        >
          <div className="flex flex-col items-center justify-center w-full" style={{ width: '80%' }}>
            <div className="w-full flex items-start">
              <h2
                className="text-base md:text-2xl font-black text-white/90 tracking-wide mb-2"
                style={{ letterSpacing: '0.08em' }}
              >
                CASH PRIZE WORTH
              </h2>
            </div>
            <h1
              id="cash-prize-text"
              className="text-[3rem] md:text-[8rem] lg:text-[10rem] font-black text-gradient-1 tracking-tight leading-none mb-4 flex items-center justify-center"
              style={{ textAlign: 'center' }}
            >
              <span className="inline text-[2.5rem] md:text-[8rem] lg:text-[10rem]">₹ </span>
              <span className="inline text-[3rem] md:text-[8rem] lg:text-[10rem] ml-2">1,00,000</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium mb-8 text-center">
              Worth of Prizes to be Won!
            </p>
            <div className="mb-8 w-full flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-bold text-gradient mb-4 text-center">
                Event Starts In
              </h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                <TimeBox label="DAYS" value={timeLeft.days} />
                <TimeBox label="HRS" value={timeLeft.hours} />
                <TimeBox label="MIN" value={timeLeft.minutes} />
                <TimeBox label="SEC" value={timeLeft.seconds} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  )
}

const TimeBox = ({ label, value }: { label: string; value: number }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevValue !== value) {
      setIsAnimating(true);
      setPrevValue(value);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [value, prevValue]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs sm:text-sm md:text-base uppercase mb-1 text-accent-cyan font-medium">{label}</span>
      <div className="bg-gradient-to-b from-accent/60 to-transparent text-white/90 font-semibold border-t-4 border-violet-500 px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 w-16 sm:w-18 md:w-20 h-12 sm:h-14 md:h-16 overflow-hidden flex items-center justify-center">
        <div className="relative h-6 sm:h-7 md:h-8 flex items-center justify-center">
          {isAnimating ? (
            <>
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 32, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeIn" }}
                className="absolute text-lg sm:text-2xl md:text-3xl font-bold"
              >
                {prevValue.toString().padStart(2, '0')}
              </motion.div>
              <motion.div
                initial={{ y: -32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut", delay: 0.15 }}
                className="absolute text-lg sm:text-2xl md:text-3xl font-bold"
              >
                {value.toString().padStart(2, '0')}
              </motion.div>
            </>
          ) : (
            <div className="text-lg sm:text-2xl md:text-3xl font-bold">
              {value.toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};