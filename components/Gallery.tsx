'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// Actual gallery images from public/gallery
const galleryImages: string[] = [
  '1.JPG','2.JPG','3.JPG','4.JPG','5.JPG','6.JPG','7.JPG','8.JPG','12.JPG','13.JPG','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg','19.jpg','20.jpg','21.jpg','22.jpg','23.jpg','24.jpg','25.jpg','26.jpg','27.jpg','28.jpg','29.jpg','30.jpg','31.jpg','32.jpg','34.jpg','35.jpg','36.jpg','37.jpg','38.jpg','39.JPG','40.jpg','41.jpg','42.jpg','Login 2012 (15).jpg','Login 2012 (21).jpg','Login 2012 (22).JPG','Login 2012 (23).JPG','login2007.jpg'
]

export default function Gallery() {
  const [activeIdx, setActiveIdx] = useState(0)
  const queueSize = 4

  // Use useRef for timer to avoid multiple intervals in StrictMode
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % galleryImages.length)
    }, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Get next images for the queue
  const queueImages = Array.from({ length: queueSize }, (_, i) => {
    const idx = (activeIdx + i + 1) % galleryImages.length
    return galleryImages[idx]
  })

  return (
    <section className="w-full py-16 font-manrope">
      <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row gap-8 items-center justify-center w-full">
        {/* Left: Big Image with fade in/out animation */}
        <div className="w-full md:w-[70%] flex items-center justify-center">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-300/30 bg-blue-300/20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={galleryImages[activeIdx]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={`/gallery/${galleryImages[activeIdx]}`}
                  alt={`LOGIN Gallery - ${galleryImages[activeIdx].replace(/\.(jpg|jpeg|png)/gi, '').replace(/[_()-]/g, ' ')}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-all duration-700"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Right: Title/content at top, queue at bottom with sliding animation */}
  <div className="w-full md:w-[32%] flex flex-col justify-between h-[500px]">
          <div className='bg-blue-300/10 p-2 rounded-lg shadow-lg'>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center drop-shadow-lg">
              Gallery
            </h2>
            <div className="text-white text-justify mb-4  text-lg max-w-xs mx-auto">
              <p className="mb-2">Explore memorable moments from previous editions of LOGIN. Our gallery showcases the vibrant energy, creativity, and legacy of our symposium through the years.</p>
              <p>Dive into our gallery to relive the highlights and see what makes LOGIN truly special!</p>
            </div>
          </div>
          <motion.div
            className="flex flex-row gap-4 items-center justify-center w-full bg-blue-300/10 p-6 rounded-lg overflow-x-hidden"
            initial={false}
            animate={{ x: [0, -120, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
            style={{ maxWidth: '520px' }}
          >
            {queueImages.slice(0, 4).map((img, idx) => (
              <div key={img} className={`relative w-[120px] h-[90px] rounded-xl overflow-hidden shadow-lg border-2 border-blue-300/30 bg-blue-300/20 flex items-center justify-center ${idx === 0 ? 'ring-2 ring-accent' : ''}`}>
                <Image
                  src={`/gallery/${img}`}
                  alt={`LOGIN Gallery - ${img.replace(/\.(jpg|jpeg|png)/gi, '').replace(/[_()-]/g, ' ')}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-all duration-500"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}