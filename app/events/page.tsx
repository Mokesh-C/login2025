'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Pacifico } from 'next/font/google'
import events from '@/data/events.json' assert { type: 'json' }
import { useRouter } from 'next/navigation'
// import { Play, Pause } from 'lucide-react' 

// Google font via next/font
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' })


export default function EventsSlider() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [rotateDeg, setRotateDeg] = useState(0)
//   const [isPlaying, setIsPlaying] = useState(true)   // autoplay starts ON
//   const togglePlay = () => setIsPlaying((p) => !p)
  
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
    

    
    useEffect(() => {
        // if (!isPlaying) return  
        const timer = setInterval(() => {
        setActive((i) => (i + 1) % events.length)
        setRotateDeg((deg) => deg + step)
        }, 3000)   
    
        return () => clearInterval(timer)
    }, []) //[isPlaying, step]

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-br from-primary via-primary-100 to-primary font-mono text-white">
      {/* Gradient background */}
      <div className="absolute inset-0" />
      {/* Orange half overlay */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-white/5" />

      {/* Giant cursive heading */}
      <div
      key={events[active].title}   
      className='absolute  left-20 top-10 w-[25%] h-[50%] bg-white/10 rounded-md flex items-center justify-center animate-fade-in '>
        <Image 
            src={events[active].eventimage}
            alt={events[active].title}
            width={600}
            height={600}
            className='object-cover w-[90%] h-[90%] rounded-lg transition-all duration-500 '
            priority
        />
      </div>
      {/* <h1
        className={`absolute right-[60%] top-[10%] w-[40%] font-satoshi font-extrabold text-[clamp(4rem,10vw,150px)] leading-[0.8] text-right drop-shadow-[3px_5px_0px_#b29bfe]`}
      >
        Events
      </h1> */}

      {/* Event copy */}
      <section className=" md:block absolute right-20 top-[10%] w-[35%] space-y-8 text-justify z-10">
  {events.map((e, i) => {
    const slug = e.title.toLowerCase().replace(/\s+/g, '')   
    return (
      <article
        key={e.title}
        className={i === active ? 'block animate-fade-in' : 'hidden'}
      >
        <h2 className="text-xl md:text-5xl font-bold text-gradient">{e.title}</h2>
        <p className="mt-4 md:text-md leading-relaxed">{e.tagline}</p>

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
            className="absolute inset-0 flex items-start justify-center "
            style={{ transform: `rotate(${-i * step}deg)` }}
          >
            <Image
              src={e.image}
              alt={e.title}
              width={150}
              height={150}
                    className={`rounded-full border-8 md:border-[10px] transition-transform duration-300 ease-in-out ${ i === active ? e.title==="STAR OF LOGIN" ? "border-cyan-300 scale-[1.2]": "border-violet-500 scale-[1.2]" : "border-white/10"}`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-[20%] top-[70%] -translate-y-1/2 text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100"
      >
        &lt;
      </button>
      <button
        onClick={next}
        className="absolute right-[20%] top-[70%] -translate-y-1/2 text-[100px] font-bold opacity-30 transition-opacity hover:opacity-100"
      >
        &gt;
      </button>
      
      {/* <button 
        onClick={togglePlay}
        className="absolute left-1/2 bottom-[6%] -translate-x-1/2 transition-transform duration-200 hover:scale-110">
              {isPlaying ? (
                  <>
                      <Pause className="w-6 h-6 md:w-10 md:h-10" />
                      <span className="mt-1 text-xs">Pause</span>
                  </>
                   
              ) : (
                  <>
                    <Play className="w-6 h-6 md:w-10 md:h-10" />
                    <span className="mt-1 text-gradient-1">Play</span>
                  </>
              )}
      </button> */}

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