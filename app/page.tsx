'use client'

import { motion } from 'framer-motion'
import Hero   from '@/components/Hero'
import About  from '@/components/About'
import Footer from '@/components/Footer'
import Profile from '@/components/Profile'

const Section = ({ id, title, bg }: { id: string; title: string; bg: string }) => (
  <motion.section
    id={id}
    className={`
      scroll-mt-24 h-screen w-full flex items-center justify-center
      ${bg} text-neutral-white
    `}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
  >
    <div className="text-center px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-4">{title}</h1>
      <p className="text-lg md:text-xl text-neutral-white/80">
        This section is under&nbsp;development
      </p>
    </div>
  </motion.section>
)


export default function Home() {
  return (
      <main className="pt-16">
      <section id="home">
        <Hero />
      </section>
      <section id="home">
        <About />
      </section>    
      <Section id="event" title="Events" bg="bg-gradient-to-bl from-primary-100 to-primary" />
      <Footer />    
      </main>
        
  )
}

