import Hero   from '@/components/Hero'
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
      </main>
        
  )
}

