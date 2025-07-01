'use client'

import { useState } from 'react'
import {
  motion,
  AnimatePresence,
  type Variants,
  type TargetAndTransition,
} from 'framer-motion'
import Image from 'next/image'
import { CalendarClock, Users, MapPin } from 'lucide-react'

import ToastCard from '@/components/ToastCard'
import type { EventCardProps } from '@/components/EventCard'

/* ---------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------*/

type EventDetails = EventCardProps & {
  description: string
  rounds: { name: string; details: string[] }[]
  rules: string[]
  contact: { name: string; phone: string }[]
  teamSize: string
  date: string
  time?: string
  location?: string
}

/* ---------------------------------------------------------------------
 * Animation presets
 * -------------------------------------------------------------------*/

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const borderAnim: TargetAndTransition = {
  borderColor: ['#bcabed', '#A78BFA', '#7759cf', '#442278', '#bcabed'],
  transition: { duration: 4, repeat: Infinity, ease: 'linear' },
}

/* ---------------------------------------------------------------------
 * Small helpers
 * -------------------------------------------------------------------*/

function MetaCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-md p-6 bg-white/10 backdrop-blur-[4px]
                 border border-white/15 shadow-md flex flex-col items-center text-center gap-2"
    >
      <div className="flex items-center gap-2 text-lg">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      {children}
    </motion.div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-md p-8 bg-white/10 backdrop-blur-[4px]
                 border border-white/15 shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------
 * Main component
 * -------------------------------------------------------------------*/

export default function EventDetailsContent({
  event,
}: {
  event: EventDetails
}) {
  /* ---------------- Toast handling ---------------- */
  const [errors, setErrors] = useState<{ id: number; message: string }[]>([])
  const notifyError = () =>
    setErrors((prev) => [
      ...prev,
      {
        id: Date.now(),
        message:
          'The site is under development — registration is unavailable.',
      },
    ])

  /* ---------------- Render ----------------------- */
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger}
      className="relative min-h-screen bg-gradient-to-br
                 from-primary via-primary-100 to-primary
                 text-white px-4 pb-24 pt-20 overflow-hidden"
    >
      {/* Toasts */}
      <AnimatePresence>
        {errors.map((e) => (
          <ToastCard
            key={e.id}
            id={e.id}
            message={e.message}
            onClose={() => setErrors((p) => p.filter((x) => x.id !== e.id))}
            textColor="text-red-700"
          />
        ))}
      </AnimatePresence>

      {/* -------------------- HERO ROW -------------------- */}
      <motion.div
        variants={fadeUp}
        className="mx-auto max-w-6xl flex flex-col md:flex-row gap-10"
      >
        {/* logo 20 % */}
        <div className="md:w-1/5 flex justify-center items-center">
          <div
            className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/10
                          backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <Image
              src={event.image}
              alt={event.title}
              width={112}
              height={112}
              className="object-contain"
            />
          </div>
        </div>

        {/* content 80 % */}
        <div className="md:w-4/5 space-y-6">
          {/* title row + register */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold font-satoshi">
              {event.title}
            </h1>

            {/* ------- animated‑border register button ------- */}
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 10px rgba(0,0,0,.25)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={notifyError}
              animate={borderAnim}
              style={{ borderColor: '#8A2BE2' }} // prevent white flash on first frame
              className="px-6 py-2 rounded-md font-medium border-2 text-white
                         bg-gradient-to-t from-accent/60 to-transparent backdrop-blur-md
                         transition-shadow duration-200"
            >
              Register
            </motion.button>
          </div>
          <p className="text-white/80 leading-relaxed">{event.description}</p>
        </div>
      </motion.div>

      {/* -------------------- META STRIP ------------------ */}
      <div className="mx-auto mt-12 max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetaCard icon={<CalendarClock />} label="Date & Time">
          <p className="font-medium">{event.date}</p>
          {event.time && <p className="text-white/80">{event.time}</p>}
        </MetaCard>

        <MetaCard icon={<Users />} label="Team Size">
          <p className="font-medium">{event.teamSize}</p>
        </MetaCard>

        <MetaCard icon={<MapPin />} label="Location">
          <p className="font-medium">{event.location ?? 'TBA'}</p>
        </MetaCard>
      </div>

      {/* -------------------- DETAILS GRID ---------------- */}
      <motion.div
        variants={stagger}
        className="mx-auto mt-16 max-w-6xl grid lg:grid-cols-12 gap-10"
      >
        {/* left column */}
        <div className="lg:col-span-8 space-y-10">
          <SectionCard title="Rounds">
            {event.rounds.map((r, i) => (
              <div key={i} className="mb-6">
                <h4 className="font-bold mb-1">
                  {i + 1}. {r.name}
                </h4>
                <ul className="list-disc ml-6 space-y-1 text-white/80">
                  {r.details.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </SectionCard>
        </div>

        {/* right column */}
        <div className="lg:col-span-4 space-y-10">
          <SectionCard title="Rules">
            <ul className="list-disc ml-6 space-y-1 text-white/80">
              {event.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Contact">
            <ul className="space-y-1 text-white/80">
              {event.contact.map((c, i) => (
                <li key={i}>
                  {c.name} — {c.phone}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </motion.div>
    </motion.section>
  )
}
