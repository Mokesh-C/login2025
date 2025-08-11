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
        className="max-w-7xl w-full mx-auto rounded-[1rem] md:rounded-[4rem] bg-blue-300/10"
        style={{
          boxShadow: '0 10px 40px 0 rgba(62, 64, 173, 0.36)'
        }}
      >
        
        {/* Left column: IMAGE */}
        <motion.div className='flex flex-col lg:flex-row items-center lg:items-stretch md:gap-8 lg:gap-0'>
            <motion.div
            variants={child}
            className="flex items-center justify-center lg:w-1/2 rounded-[1rem] md:rounded-[3rem] m-6 md:m-12 bg-blue-300/10 overflow-hidden"
            >
            <Image
                src="/about.png"
                alt="About LOGIN"
                width={280}
                height={330}
                className="object-contain "
                priority
            />
            </motion.div>

            {/* Right column: CONTENT */}
            <motion.div
            variants={child}
            className="lg:w-1/2 flex flex-col justify-center font-montserrat p-8 pb-0 md:pb-8"
            >
            <h2 className="text-2xl lg:text-4xl font-bold mb-6 text-white">
                About LOGIN
            </h2>
            <p className="text-md lg:text-lg leading-7 text-neutral-white/90 space-y-4">
                The 34<sup>th</sup> edition of LOGIN, the celebrated national-level technical symposium of PSG
                College of Technology, is proudly organized by the Computer Applications Association. Since its
                inception in 1990, LOGIN has been a platform for innovation, collaboration, and intellectual
                exchange—empowering generations of tech enthusiasts to explore the ever-evolving frontiers of
                technology. With a legacy spanning more than three decades, the event continues to adapt and
                grow alongside the digital age, maintaining its relevance and impact.
                <br />
                <br />
            </p>

            </motion.div>
        </motion.div>
        <motion.div 
        variants={child}
        className='font-montserrat p-8 pt-0 pl-12'>
            <p className="text-md lg:text-lg leading-7 text-neutral-white/90 space-y-4">
                This year, LOGIN’25 embraces the theme “The Immersive Point: Redefining Reality through
                Immersive Systems”—a journey into technologies that blur the line between the physical and the
                virtual realms. From Virtual Reality and Augmented Reality to Mixed Reality and beyond,
                immersive systems are reshaping how we learn, work, create, and connect.
                <br />
                <br />
                Set to take place on the 20<sup>th</sup> and 21<sup>st</sup> of September&nbsp;2025, LOGIN’25 invites
                postgraduate students from diverse disciplines across the nation to engage in a vibrant mix of
                technical challenges, creative showcases, and collaborative competitions. With participation
                from over 50 renowned institutions every year, the symposium celebrates the spirit of
                problem-solving, forward-thinking, and immersive innovation—fueling minds to not just adapt to
                the future, but actively shape it.
            </p>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
