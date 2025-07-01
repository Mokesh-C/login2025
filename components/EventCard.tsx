'use client'

import { motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export type EventCardProps = {
  title: string
  tagline: string
  image: string // e.g. '/Nethunt.png'
  mode?: string // e.g. 'Online', 'Offline'
  type?: string // e.g. 'Technical', 'Non‑technical'
}

/* ------------------------------------------------------------------
 * Animation variants
 * ----------------------------------------------------------------*/

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 60, damping: 12 },
  },
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 120, damping: 8 },
  },
}

const imageVariants: Variants = {
  rest: { rotate: 0 },
  hover: {
    rotate: 720,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
}

/* ------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------*/

export default function EventCard({ event }: { event: EventCardProps }) {
  const router = useRouter()
  const slug = event.title.toLowerCase().replace(/\s+/g, '')

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/events/${slug}`)}
      className="group relative mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-md border border-accent-purple/60 bg-white/10 backdrop-blur-[6px] transition-all duration-300 hover:border-accent-violet/60"
    >
      {/* Hover glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent-purple via-accent-violet to-accent-purple opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-75" />

      {/* Card body */}
      <div className="relative h-full bg-gradient-to-b from-primary-100/60 to-primary/80 p-6 backdrop-blur-xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-violet/30 blur-sm" />

            {/* Rotating inner logo - controlled by parent card hover */}
            <motion.div
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-accent-cyan/40 bg-primary"
            >
              <motion.div
                variants={imageVariants}
                className="flex h-16 w-16 items-center justify-center"
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  width={40}
                  height={40}
                  className="object-contain brightness-110"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Title & tagline */}
        <h3 className="mb-2 text-center font-satoshi text-xl font-bold text-foreground">
          {event.title}
        </h3>
        <p className="mb-8 text-center font-baloo text-sm leading-relaxed text-neutral-muted">
          {event.tagline}
        </p>

        {/* CTA */}
        <div className="mb-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 rounded-md border border-accent-violet/30 bg-gradient-to-r from-accent/60 to-transparent px-8 py-3 font-baloo font-medium text-white shadow-lg transition-all duration-200 hover:shadow-accent-violet/25"
          >
            Explore More
          </motion.button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around bg-white/10 px-6 py-4 backdrop-blur-sm">
          <span className="font-baloo text-sm text-neutral-chapter">
            {event.mode ?? 'Offline'}
          </span>
          <div className="h-4 w-px bg-white/20" />
          <span className="font-baloo text-sm text-neutral-chapter">
            {event.type ?? 'Technical'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
