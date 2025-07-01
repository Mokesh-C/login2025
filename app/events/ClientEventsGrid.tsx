'use client'

import { motion, type Variants } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { EventCardProps } from '@/components/EventCard'

// Dynamically load EventCard to prevent hydration mismatch
const EventCard = dynamic(() => import('@/components/EventCard'), { ssr: false })

// Typed animation variants
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export default function ClientEventsGrid({ events }: { events: EventCardProps[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
    >
      {events.map((event, i) => (
        <motion.div key={i} variants={cardVariants}>
          <EventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  )
}
