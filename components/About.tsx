'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function About() {
  // Animation presets
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
        scroll-mt-24 w-full min-h-screen flex items-center justify-center
        py-4 md:py-16 px-4
      "
    >
      <motion.div
        variants={parent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center lg:items-stretch md:gap-8 lg:gap-0 rounded-[1rem] md:rounded-[4rem] bg-blue-300/10"
        style={{
          boxShadow: '0 10px 40px 0 rgba(62, 64, 173, 0.36)'
        }}
      >
        
        {/* Left column: IMAGE */}
        <motion.div
          variants={child}
          className="flex items-center justify-center lg:w-1/2 rounded-[1rem] md:rounded-[3rem] m-6 md:m-12 bg-blue-300/10 overflow-hidden"
        >
          <Image
            src="/about.png"
            alt="About LOGIN"
            width={380}
            height={430}
            className="object-contain w-full min-w-full min-h-full"
            priority
          />
        </motion.div>

        {/* Right column: CONTENT */}
        <motion.div
          variants={child}
          className="lg:w-1/2 flex flex-col justify-center font-montserrat p-8"
        >
          <h2 className="text-2xl lg:text-4xl font-bold mb-6 text-white">
            About LOGIN
          </h2>
          <p className="text-md lg:text-lg leading-7  text-neutral-white/90 space-y-4">
            LOGIN, an esteemed international technical symposium now in its 34<sup>th</sup> edition, is proudly presented by the Computer Applications Association.
            <br /><br />
            As AI reshapes our digital world, much like a symphony where each instrument plays a vital role, AI technologies come together to form a powerful network. This symposium explores AI&apos;s transformative impact, highlighting its potential to revolutionize industries, enhance daily life, and tackle global challenges with creativity and compassion.
            <br /><br />
            Scheduled for the 20<sup>th</sup> &amp; 21<sup>st</sup> of September&nbsp;2025, we invite postgraduate students worldwide to engage in a dynamic experience of competition and collaboration.
            <br /><br />
            Join us as we refine, recognize, and reward those contributing to the symphony of digital intellect, celebrating AI&apos;s ability to inspire, innovate, and impact the world.
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
