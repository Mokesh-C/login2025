'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Pacifico } from 'next/font/google'
import events from '@/data/events.json' assert { type: 'json' }
import { useRouter } from 'next/navigation'

// Google font via next/font
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' })


export default function EventsSlider() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [rotateDeg, setRotateDeg] = useState(0)
  
  const step = 360 / events.length 
  const next = () => {
    setActive((i) => (i + 1) % events.length)
    setRotateDeg((deg) => deg + step)
    }
    
    const prev = () => {
        setActive((i) => (i - 1 + events.length) % events.length)
        setRotateDeg((deg) => deg - step)
    }    
    const translateY = '-410px' 
    

    
    // useEffect(() => {
    //     const timer = setInterval(() => {
    //     // advance just like the `next` handler
    //     setActive((i) => (i + 1) % events.length)
    //     setRotateDeg((deg) => deg + step)
    //     }, 2000)   // 3 s per slide
    
    //     return () => clearInterval(timer)   // stop when component unmounts
    // }, [])

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-br from-primary via-primary-100 to-primary font-mono text-white">
      {/* Gradient background */}
      <div className="absolute inset-0" />
      {/* Orange half overlay */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-white/5" />

      {/* Giant cursive heading */}
      <h1
        className={`absolute right-[60%] top-[10%] w-[40%] font-satoshi font-extrabold text-[clamp(4rem,10vw,150px)] leading-[0.8] text-right drop-shadow-[3px_5px_0px_#b29bfe]`}
      >
        Events
      </h1>

      {/* Event copy */}
      <section className=" md:block absolute left-[60%] top-[10%] w-[350px] space-y-8 text-justify z-10">
  {events.map((e, i) => {
    const slug = e.title.toLowerCase().replace(/\s+/g, '')   
    return (
      <article
        key={e.title}
        className={i === active ? 'block animate-fade-in' : 'hidden'}
      >
        <h2 className="text-xl md:text-4xl font-bold text-gradient">{e.title}</h2>
        <p className="mt-4 text-sm leading-relaxed">{e.tagline}</p>

        {/* Navigate to /events/[slug] */}
        <button
          type="button"
          onClick={() => router.push(`/events/${slug}`)}
          className="mt-5 bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-2 px-6 rounded-md hover:shadow-purple-500/25 hover:cursor-pointer"
        >
          Explore More
        </button>
      </article>
    )
  })}
</section>

      {/* Rotating image wheel */}
      <div
        className="absolute left-1/2 bottom-[-40%] aspect-square w-[1100px] -translate-x-1/2 translate-y-1/2 rounded-full  outline-3 outline-dashed outline-white/30 transition-transform duration-500 outline-offset-[-100px]"
        style={{ transform: `translate(-50%,50%) rotate(${rotateDeg}deg)` }}
      >
        {events.map((e, i) => (
          <div
            key={e.title}
            className="absolute inset-0 flex items-start justify-center"
            style={{ transform: `rotate(${-i * step}deg)` }}
          >
            <Image
              src={e.image}
              alt={e.title}
              width={170}
              height={170}
              className=""
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-[250px] top-[60%] -translate-y-1/2 text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100"
      >
        &lt;
      </button>
      <button
        onClick={next}
        className="absolute right-[250px] top-[60%] -translate-y-1/2 text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100"
      >
        &gt;
      </button>

      {/* Fade‑in keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </main>
  )
}