'use client'

import React, { useRef, useLayoutEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Calendar, Clock, MapPin, Star, Coffee, Utensils, 
  Code2, Brain, Gavel, Gamepad2, Camera, Lightbulb, Compass, Award, HelpCircle  } from 'lucide-react'

const schedule = [
  {
    day: '0',
    date: 'September 14 – 18, 2025',
    eventType: 'online',
    events: [
      { title: 'NetHunt',          time: 'Sep 14 · 6:00 PM – 8:00 PM', icon: Compass,   type: 'event' },
      { title: 'Treasure Hunt',    time: 'Sep 15 · 6:00 PM – 7:00 PM', icon: MapPin,    type: 'event' },
      { title: 'Thinklytics',      time: 'Sep 16 · 6:00 PM – 7:00 PM', icon: Lightbulb, type: 'event' },
      { title: 'Crickbid Auction', time: 'Sep 16 · 6:00 PM – 7:00 PM', icon: Gavel,     type: 'event' },
      { title: 'CodeSprint',       time: 'Sep 17 · 6:00 PM – 7:00 PM', icon: Code2,     type: 'event' },
      { title: 'CodeSprint',       time: 'Sep 18 · 6:00 PM – 8:00 PM', icon: Code2,     type: 'event' },
    ],
  },
  {
    day: '01',
    date: 'September 20, 2025',
    eventType: 'offline',
    events: [
      { title: 'Witty Mindz', time: '10:30 AM – 1:00 PM',icon: Brain,     type: 'event' },
      { title: 'Quiz Arena',  time: '10:30 AM – 1:00 PM',icon: HelpCircle,type: 'event' },
      { title: 'Big O Battle',time: '2:00 PM – 6:00 PM', icon: Code2,     type: 'event' },
      { title: 'Valo Strike', time: '2:00 PM – 6:00 PM', icon: Gamepad2,  type: 'event' },
    ],
  },
  {
    day: '02',
    date: 'September 21, 2025',
     eventType: 'offline',
    events: [
      { title: 'Treasure Hunt (Finals)',  time: '8:30 AM – 10:00 AM',  icon: MapPin,    type: 'event' },
      { title: 'Picture Perfect',         time: '8:30 AM – 10:00 AM',  icon: Camera,    type: 'event' },
      { title: 'Thinklytics (Finals)',    time: '10:00 AM – 12:30 PM', icon: Lightbulb, type: 'event' },
      { title: 'Crickbid Auction (Finals)', time: '10:00 AM – 12:30 PM', icon: Gavel,  type: 'event' },
      { title: 'Star of Login',           time: '1:30 PM',             icon: Star,      type: 'special' },
    ],
  },
]

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [timelineH, setTimelineH] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  // Track hydration
  useLayoutEffect(() => {
    setHydrated(true)
  }, [])

  // Measure container height
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const measure = () => setTimelineH(containerRef.current!.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Scroll progress (0 to 1) for the timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end end'],
  })

  // Smooth scroll progress with spring animation
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  // Transform progress to bar height
  const barHeight = useTransform(smoothProgress, v => timelineH ? v * timelineH : 0)

  let seq = -1

  return (
    <div className="relative flex flex-col items-center justify-center px-2 font-manrope">
      {/* Timeline rail */}
      <div className="absolute top-0 left-6 sm:left-[12%] mob:left-1/2 mob:-translate-x-1/2 h-full w-2 bg-gray-700/40 z-0 rounded-full" />

      {/* Progress fill + end-dot */}
      <div className="absolute top-0 left-6 sm:left-[12%] mob:left-1/2 mob:-translate-x-1/2 w-2 h-full pointer-events-none z-10 flex flex-col items-center">
        {hydrated && (
          <>
            <motion.div
              className="w-full bg-gradient-to-b from-purple-400 via-violet-600 to-violet-400 rounded-full"
              style={{ height: barHeight }}
            />
            <motion.div className="absolute left-1/2  -translate-x-1/2" style={{ top: barHeight }}>
              <div className="relative flex  items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-violet-400 to-purple-950 opacity-80 animate-pulse" />
                <div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-violet-950 border-4 border-purple-400 shadow-lg" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* START label */}
      <div className="relative w-full max-w-4xl pt-2.5 pl-0.5 z-20 flex items-center mb-12">
        <div className="absolute sm:left-[8.8%] mob:left-1/2 mob:-translate-x-1/2 flex flex-col items-center">
          <span className="mb-2 text-sm font-bold text-gradient-1 tracking-wider">Start</span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-violet-950 flex items-center justify-center border-4 border-white shadow-lg" />
        </div>
      </div>

      {/* Timeline content */}
      <div ref={containerRef} className="relative w-full max-w-4xl z-20">
        {schedule.map((dayBlock, dayIdx) => (
          <React.Fragment key={dayIdx}>
            {/* DAY heading */}
            <section className="relative flex md:items-start items-center flex-col py-8">
                {dayBlock.day !== '0' && (
                  <span className="top-2 left-0 text-sm font-bold text-gradient-1 tracking-wider">
                    {dayBlock.eventType.toUpperCase()} EVENTS
                  </span>
                )}  
              <h2 className="text-3xl md:text-4xl font-extrabold text-violet-400">
                 {dayBlock.day === '0' ? `${dayBlock.eventType.toUpperCase()} EVENTS` : `DAY ${dayBlock.day} `}
              </h2>
              <span className="mt-1 text-sm tracking-wide text-violet-300">{dayBlock.date}</span>
            </section>
            {dayBlock.events.map((event, idx) => {
              seq += 1
              const isCardLeft = seq % 2 === 0
              const isNumberLeft = !isCardLeft
              const Icon = event.icon

              return (
                <section key={`${dayIdx}-${idx}`} className="relative flex min-h-[180px] items-center justify-center overflow-hidden">
                  {/* Step number */}
                  {hydrated && (
                    <motion.div
                      className={`absolute z-10 select-none pointer-events-none
                        ${isNumberLeft ? 'hidden mob:block mob:left-[25%]' : 'hidden mob:block mob:right-[25%]'}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 0.09, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 * seq }}
                      viewport={{ once: true, amount: 0.5 }}
                    >
                      <span className="text-[3rem] md:text-[6rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-violet-400">
                        {String(seq + 1).padStart(2, '0')}
                      </span>
                    </motion.div>
                  )}
                  {/* Dot on the timeline line */}
                  <div className="absolute top-1/2 left-5 sm:left-[11.6%] mob:left-1/2 mob:-translate-x-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full opacity-80 animate-pulse" />
                      <div className="absolute w-7 h-7 rounded-full bg-white border-4 border-purple-400 shadow-lg" />
                    </div>
                  </div>
                  {/* Card */}
                  <motion.div
                    className={`relative w-full max-w-md ml-[56px] mob:ml-0
                      ${isCardLeft ? 'mob:mr-auto mob:pr-16 mob:text-right' : 'mob:ml-auto mob:pl-16 mob:text-left'}
                      text-left`}
                    initial={{ opacity: 0, x: isCardLeft ? -80 : 80 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * seq, type: 'spring', stiffness: 100 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <div className="relative rounded-md bg-blue-300/10 p-6 shadow-xl border-l-4 border-violet-400">
                      <div className="flex items-center gap-4 m-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-300/10 p-3 shadow-lg">
                          <Icon className="h-6 w-6 text-cyan-400" />
                        </span>
                        <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                    </div>
                  </motion.div>
                </section>
              )
            })}
          </React.Fragment>
        ))}
        <section className="relative flex md:items-start items-center flex-col py-8">
              <h2 className="invisible">DAY</h2>
              <span className="mt-3 invisible">Program Ends</span>
        </section>
      </div>

      {/* END label */}
      <div className="relative w-full max-w-4xl z-20 flex flex-col items-start mt-4">
        <div className="absolute left-1.5 sm:left-[9.6%] mob:left-1/2 mob:-translate-x-1/2 flex flex-col items-center -top-16">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-violet-950 flex items-center justify-center border-4 border-white shadow-lg" />
          <span className="mt-2 text-sm font-bold text-gradient-1 tracking-wider">End</span>
        </div>
      </div>
    </div>
  )
}
