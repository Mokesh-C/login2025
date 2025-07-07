'use client'

import { useState } from 'react'
import {
  motion,
  AnimatePresence,
  type Variants,
  type TargetAndTransition,
} from 'framer-motion'
import Image from 'next/image'
import { CalendarClock, Users, MapPin,ArrowLeft, 
    Calendar, 
    Clock,
    DollarSign, 
    Trophy, 
    FileText, 
    Phone, 
    Mail, 
    User,
    Tag,
    Star,
    Award,
    CheckCircle, ListCheck } from 'lucide-react'

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
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-md p-8 bg-white/10 backdrop-blur-[4px]
                 border border-white/15 shadow-md"
    >
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
                 text-white px-4 pb-24 pt-10 overflow-hidden"
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
        className="relative z-10 p-1 pb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className='flex gap-5 '>
                    <div className="md:w-1/4 flex justify-center items-center">
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
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {event.title}
                            <span className="block text-3xl lg:text-4xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                                Challenge Awaits
                            </span>
                            </h1>
                    </div>
                </div>
                
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  {'Showcase your programming skills in this intense coding competition.'}
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.button 
                className={`bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={notifyError}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: 0.5 }}
              >
                Register Now 
              </motion.button>
            </div>

            {/* Right Image */}
            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative rounded-md overflow-hidden border border-white/20 shadow-2xl">
                <img 
                  src={'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                  alt={event.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                className="absolute -top-6 -right-6 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-md p-4 shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md p-4 shadow-2xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      
      
      <div className="relative z-10 max-w-7xl mx-auto md:px-6 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Event Details Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-md p-6 border border-white/10 sticky top-6 hover:bg-white/8 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                Event Details
              </h3>
              
              <div className="space-y-5">
                {[
                  { icon: Calendar, label: 'Date', value: event.date },
                  { icon: Clock, label: 'Time', value: 'TBA' },
                  { icon: MapPin, label: 'Venue', value: 'TBA' },
                  { icon: Users, label: 'Team Size', value: event.teamSize }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-md bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                      <item.icon className={`w-5 h-5 text-cyan-400`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="font-semibold text-white">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>


            {/* Coordinators */}
            <div className="bg-white/5 backdrop-blur-sm rounded-md p-6 border border-white/10 hover:bg-white/8 transition-all duration-500">
              <h3 className="text-xl font-bold text-white mb-4">Event Coordinators</h3>
              <div className="space-y-4">
                {event.contact.map((coordinator, index) => (
                  <div key={index} className="p-4 rounded-md bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300">
                    <p className="font-semibold text-white mb-2">{coordinator.name}</p>
                    <div className="space-y-2">
                      <a 
                        href={`tel:${coordinator.phone}`}
                        className={`flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-400 transition-colors`}
                      >
                        <Phone className="w-4 h-4" />
                        {coordinator.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-white/8 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                  <FileText className={`w-7 h-7 text-cyan-400`} />
                </div>
                About This Event
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {event.description}
              </p>
            </motion.div>
            
            {/*Rounds*/}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-white/8 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                <div className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                  <ListCheck className={`w-7 h-7 text-cyan-400`} />
                </div>
                Rounds
              </h2>
              <div className="lg:col-span-8 space-y-10">
              {event.rounds.map((r, i) => (
                  <motion.div 
                    key={i} 
                    className="p-5 rounded-md bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ x: 5 }}
                  >
                      <h4 className="font-bold mb-1">
                        {i + 1}. {r.name}
                        </h4>
                        <ul className="list-disc ml-6 space-y-1 text-white/80">
                        {r.details.map((d, j) => (
                            <li key={j}>{d}</li>
                        ))}
                        </ul>
                  </motion.div>
                ))}
              </div>
              
            </motion.div>

            {/* Rules Section */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-white/8 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                <div className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                  <CheckCircle className={`w-7 h-7 text-cyan-400`} />
                </div>
                Rules & Guidelines
              </h2>
              <div className="space-y-4">
                {event.rules.map((rule, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-4 p-5 rounded-md bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 5 }}
                  >
                    <div className={`w-10 h-10 rounded-md bg-gradient-to-br from-violet-400/30 to-purple-950/10 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-purple-400/30`}>
                      {index + 1}
                    </div>
                    <span className="text-gray-300 leading-relaxed text-lg">{rule}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
          </div>

          
          
        </div>
      </div>
    </motion.section>
  )
}
