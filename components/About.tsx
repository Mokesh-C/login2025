'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function About() {
  // animation presets
  const parent = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  }

  const child = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <motion.section
      id="about"
      className="
        scroll-mt-24 w-full min-h-screen
        bg-gradient-to-br from-primary to-primary-100   /* ⬅︎ new gradient colours */
        text-neutral-white                               /* ⬅︎ neutral.white */
        py-16
      "
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between gap-12">
        {/* left column */}
        <motion.div variants={child} className="lg:w-1/2">
          <h2 className="text-2xl lg:text-4xl font-bold mb-6">About LOGIN</h2>

          {/* 90 %-opacity white now uses slash-opacity utility */}
          <p className="text-md text-pretty  lg:text-lg leading-7 font-montserrat text-neutral-white/90 space-y-4">
            LOGIN, an esteemed international technical symposium now in its 34<sup>th</sup>{' '}
            edition, is proudly presented by the Computer Applications Association.
            <br />
            <br />
            As AI reshapes our digital world, much like a symphony where each instrument plays a
            vital role, AI technologies come together to form a powerful network. This symposium
            explores AI&apos;s transformative impact, highlighting its potential to revolutionize
            industries, enhance daily life, and tackle global challenges with creativity and
            compassion.
            <br />
            <br />
            Scheduled for the 21<sup>st</sup> &amp; 22<sup>nd</sup> of September&nbsp;2025, we
            invite postgraduate students worldwide to engage in a dynamic experience of competition
            and collaboration.
            <br />
            <br />
            Join us as we refine, recognize, and reward those contributing to the symphony of
            digital intellect, celebrating AI&apos;s ability to inspire, innovate, and impact the
            world.
          </p>
        </motion.div>

        {/* right column */}
        <motion.div variants={child} className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <Image
            src="/about.png"
            alt="About LOGIN"
            width={500}
            height={400}
            className="w-full max-w-md h-auto"
            priority
          />
        </motion.div>
      </div>
    </motion.section>
  )
}
