'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FAQ() {
  // State to manage which FAQ item is open
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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

  // FAQ data tailored for LOGIN symposium
  const faqs = [
    {
      question: 'Who can participate in LOGIN 2025?',
      answer:
        'LOGIN 2025 is open to postgraduate students pursuing M.E., M.Tech., MCA, MBA, and other PG programs from recognized institutions worldwide.',
    },
    {
      question: 'What are the dates for LOGIN 2025?',
      answer:
        'The symposium is scheduled for September 20th and 21st, 2025, at PSG College of Technology, Coimbatore.',
    },
    {
      question: 'What types of events are included in LOGIN 2025?',
      answer:
        'LOGIN 2025 features over 10 events, including technical competitions, coding challenges, and fun events to foster innovation and collaboration.',
    },
    {
      question: 'Is there a registration fee for LOGIN 2025?',
      answer:
        'Yes, a nominal registration fee is required for participation. Details about the fee structure are available on the registration page of our website.',
    },
    {
      question: 'Can undergraduate students participate in LOGIN 2025?',
      answer:
        'No, LOGIN 2025 is exclusively for postgraduate students. Undergraduate students are encouraged to explore other events organized by PSG College of Technology.',
    },
  ]

  return (
    <motion.section
      id="faq"
      className="
        scroll-mt-24 w-full 
        text-neutral-white
        py-8 mb-16 font-manrope
      "
      variants={parent}
      initial="hidden"
      whileInView="show"
  viewport={{ once: true, amount: 0.15 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          variants={child}
          className="text-2xl lg:text-4xl font-bold mb-12"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={child}
              className="bg-blue-300/5 backdrop-blur-sm rounded-lg shadow-md border border-blue-300/10"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left  text-neutral-white"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-accent-cyan" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-accent-cyan" />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0 }}
                  className="p-4 pt-0 text-neutral-white/90 "
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}