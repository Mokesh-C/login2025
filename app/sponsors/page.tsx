'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Sponsor = { name: string; logo: string; year?: string };

const CURRENT_SPONSORS: Sponsor[] = [
  { name: '247.ai', logo: '/sponsors/247-ai-logo.png' },
];

const PREVIOUS_SPONSORS: Sponsor[] = [
  { name: 'FourKites', logo: '/sponsors/FourKites_New-Logo_Positive_RGB.png' },
  { name: 'KLA', logo: '/sponsors/KLA.png' },
  { name: 'Expedia', logo: '/sponsors/Expedia-Logo-2048x1152.png' },
  { name: 'Walker Scott', logo: '/sponsors/walkerscott-logo.webp' },
  { name: 'eBay', logo: '/sponsors/EBAY-a442b3a2.png' },
  { name: 'Root Quotient', logo: '/sponsors/Rootquotient-Logo-Full-BlackText.png'},
  { name: 'ST Courier', logo: '/sponsors/STCourier.png' },
  { name: 'Intel', logo: '/sponsors/INTC.png' },
  // { name: 'Malabar Gold and Diamonds', logo: '/sponsors/malabardiamondlogo.png' },
  { name: 'Cognizant', logo: '/sponsors/Cognizant-Logo.png' },
  { name: 'Visteon', logo: '/sponsors/visteon.png' },
  { name: 'DE Shaw', logo: '/sponsors/DEShaw.webp' },
  { name: 'Skava', logo: '/sponsors/logo_SKAVA_sinfondo.png' },
  { name: 'TVS', logo: '/sponsors/tvs-logo-tvs-icon-transparent-free-png.webp' },
  { name: 'AECC', logo: '/sponsors/aecc.png' },
  { name: 'Air Media', logo: '/sponsors/airmedia.png' },
  { name: 'HP', logo: '/sponsors/hp.png' },
  { name: 'Yamaha', logo: '/sponsors/Yamaha.webp' },

];

const Card = ({ sponsor }: { sponsor: Sponsor }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -6 }}
    className="group relative w-72 rounded-lg overflow-hidden bg-white/10 backdrop-blur-md shadow-lg hover:shadow-purple-500/40"
  >
    <div className="flex items-center justify-center h-48 w-full bg-violet-500/5 py-8">
      <Image
        src={sponsor.logo}
        alt={sponsor.name}
        width={192}
        height={192}
        unoptimized
        className="h-48 w-full object-contain transition-all duration-300 group-hover:scale-105 bg-white p-3 md:p-6 "
      />
    </div>
    {/* overlay */}
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
      <div
        className="w-full translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-violet-900/50 to-transparent p-3 text-center backdrop-blur-sm"
      >
        <p className="text-lg  text-violet-700 font-bold tracking-wide">
          {sponsor.name}
        </p>
        {sponsor.year && (
          <p className="text-sm text-purple-200">{sponsor.year}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const Section = ({ title, sponsors }: { title: string; sponsors: Sponsor[] }) => (
  <>
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-2xl text-gradient sm:text-3xl font-bold text-center mt-12"
    >
      {title}
    </motion.h3>

    <div className="flex flex-wrap justify-center gap-8 mt-8 max-w-7xl mx-auto px-4">
      {sponsors.map((s) => (
        <Card key={s.name} sponsor={s} />
      ))}
    </div>
  </>
);

export default function SponsorsPage() {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-accent-first via-accent-second to-accent-third text-white py-16">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl text-cyan-400 sm:text-4xl md:text-5xl font-bold text-center"
      >
        Partner With Us
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-base text-gray-300 sm:text-lg md:text-xl text-center mt-4 max-w-4xl mx-auto"
      >
        We are proud to collaborate with organisations whose support drives the success of LOGIN. 
        Here’s a look at our valued partners who have contributed to the success of LOGIN.
      </motion.p>

      <Section title="2025 Sponsors" sponsors={CURRENT_SPONSORS} />
      <Section title="Our Previous Sponsors" sponsors={PREVIOUS_SPONSORS} />
    </section>
  );
}
