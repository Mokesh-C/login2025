'use client'

import { motion, type Variants } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const schedule = [
  {
    day: 'DAY 01',
    events: [
      { title: 'INAUGURATION OF LOGIN 2024', time: '9:30 AM – 10:20 AM', venue: 'F‑Block Assembly Hall (2nd Floor)' },
      { title: 'TEA BREAK',                   time: '10:20 AM – 10:40 AM', venue: 'F‑Block Canteen (Ground Floor)' },
      { title: 'OFFLINE EVENTS',              time: '10:40 AM – 12:45 PM' },
      { title: 'LUNCH',                       time: '12:45 PM – 01:45 PM', venue: 'F‑Block Canteen (Ground Floor)' },
      { title: 'OFFLINE EVENTS',              time: '01:45 PM – 04:15 PM' },
      { title: 'TEA BREAK',                   time: '04:15 PM – 04:45 PM', venue: 'F‑Block Canteen (Ground Floor)' },
    ],
  },
  {
    day: 'DAY 02',
    events: [
      { title: 'OFFLINE EVENTS', time: '08:30 AM – 12:20 PM' },
      { title: 'LUNCH BREAK',    time: '12:20 PM – 01:45 PM', venue: 'F‑Block Canteen (Ground Floor)' },
      { title: 'STAR OF LOGIN',  time: '01:45 PM – 04:00 PM' },
      { title: 'VALEDICTORY',    time: '04:00 PM – 06:00 PM', venue: 'F‑Block Conference Hall (1st Floor)' },
      { title: 'TEA BREAK',      time: '06:00 PM – 06:30 PM' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Animation variants (typed)                                         */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
}

const dayVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateX: -90,
    y: -50,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const eventVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
    rotateY: -45,
    x: -100,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    x: 0,
    transition: { type: 'spring', damping: 15, stiffness: 100 },
  },
}

const dotVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 200,
      delay: 0.2,
    },
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ScheduleTimeline() {
  return (
    <motion.div
      className="mx-auto max-w-7xl px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {schedule.map((dayBlock, i) => (
          <motion.div key={i} variants={dayVariants} className="space-y-8">
            {/* Day heading ------------------------------------------------ */}
            <motion.h2
              className="mb-8 text-center font-satoshi text-3xl font-bold text-foreground"
              whileHover={{
                scale: 1.1,
                textShadow: '0px 0px 8px rgba(255,255,255,0.8)',
                transition: { duration: 0.3 },
              }}
            >
              {dayBlock.day}
            </motion.h2>

            {/* Event list ------------------------------------------------- */}
            <div className="space-y-6">
              {dayBlock.events.map((event, idx) => (
                <motion.div
                  key={idx}
                  variants={eventVariants}
                  whileHover={{
                    scale: 1.05,
                    rotateX: 5,
                    z: 50,               // 3‑D “pop”
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex items-start gap-4"
                >
                  {/* Timeline dot --------------------------------------- */}
                  <motion.div variants={dotVariants} className="mt-2 flex-shrink-0">
                    <motion.div
                      className="relative h-5 w-5 rounded-full border-4 border-white bg-purple-500 shadow-md"
                      whileHover={{
                        scale: 1.3,
                        boxShadow: '0 0 20px rgba(59,130,246,0.8)',
                      }}
                    >
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-violet-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Event card ---------------------------------------- */}
                  <motion.div
                    className="relative flex-1 overflow-hidden rounded-md border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-lg"
                    whileHover={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {/* Sliding highlight on card hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />

                    <motion.h3
                      className="relative z-10 mb-2 font-baloo text-xl font-semibold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.5 }}
                    >
                      {event.title}
                    </motion.h3>

                    <motion.p
                      className="relative z-10 text-gray-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.6 }}
                    >
                      {event.time}
                    </motion.p>

                    {event.venue && (
                      <motion.p
                        className="relative z-10 text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.7 }}
                      >
                        Venue:&nbsp;
                        <span className="font-medium">{event.venue}</span>
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
