'use client'
import Hero from '@/components/Hero'
import About  from '@/components/About'
import Footer from '@/components/Footer'
import FAQ from '@/components/FAQ'
import Gallery from '@/components/Gallery'

export default function Home() {
  return (
  <main className="bg-gradient-to-br from-accent-first via-accent-second to-accent-third"> 
      <section id="home">
        <Hero />
      </section>
      <section id="home">
        <About />
      </section>    
      <section id="gallery">
        <Gallery />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <Footer />    

      {/* Floating Idea Quest Button - always visible at right bottom of viewport */}
      <a
  href="/idea-quest"
  className="fixed bg-gradient-to-br from-accent-first via-accent-second to-accent-third right-8 bottom-8 z-[9999] flex items-center gap-3 px-6 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 cursor-pointer idea-quest-animated-border"
  style={{ position: 'fixed' }}
>
  {/* Lightbulb icon for Idea Quest */}
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-up-right-icon lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
  Idea Quest
  <style jsx>{`
    .idea-quest-animated-border {
      position: relative;
      color: #fff;
      box-shadow: 0 4px 24px 0 rgba(138, 75, 175, 0.25);
      border-radius: 9999px;
      border: 4px solid transparent;
      background-clip: padding-box;
      z-index: 9999;
    }
    .idea-quest-animated-border::before {
      content: '';
      position: absolute;
      inset: -4px;
      z-index: -1;
      border-radius: 9999px;
      background: transparent;
      border: 4px solid transparent;
      background: linear-gradient(270deg, #4b0082, #800080, #00b7eb, #4b0082) border-box;
      background-size: 600% 600%;
      animation: borderMove 3s linear infinite;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
    @keyframes borderMove {
      0% { background-position: 0% 50%; }
      100% { background-position: 600% 50%; }
    }
  `}</style>
</a>
    </main>
  )
}

