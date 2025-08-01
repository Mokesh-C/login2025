'use client'

import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

/* ─────────────────────────
   DATA
───────────────────────── */
type TeamMember = {
  name: string
  about: string
  imageUrl: string
  email?: string
  socials?: {
    github?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

const OFFICE_BEARERS: TeamMember[] = [
  {
    name: 'Mohan Prasath',
    about: 'Secretary',
    imageUrl: '/coordinators/MohanPrasath.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Nivethithaa',
    about: 'Treasurer',
    imageUrl: '/coordinators/Nivethithaa.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Kalaivanan',
    about: 'Event Coordinator',
    imageUrl: '/coordinators/Kalaivanan.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Sanjay',
    about: 'Event Coordinator',
    imageUrl: '/coordinators/Sanjay.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
]

const DEV_TEAM: TeamMember[] = [
  {
    name: 'Praveen',
    about: 'Web Development Team Lead',
    imageUrl: '/coordinators/Praveen.JPG',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Jeffry Patrick',
    about: 'Backend Developer',
    imageUrl: '/coordinators/Jeffrypatrick.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
  {
    name: 'Mokesh',
    about: 'Frontend Developer and UI Designer',
    imageUrl: '/coordinators/Mokesh.jpg',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  },
//   {
//     name: 'Balaji',
//     about: 'Frontend Developer',
//     imageUrl: '/coordinators/Balaji.jpg',
//     email: 'hello@example.com',
//     socials: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
//   },
]

/* ─────────────────────────
   ANIMATION VARIANTS
───────────────────────── */
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.15,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  }

/* ─────────────────────────
   CARD COMPONENT
───────────────────────── */
function TeamCard({
  name,
  about,
  imageUrl,
  email,
  socials = {},
}: TeamMember) {
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isImgHovered, setIsImgHovered] = useState(false)

  // Profile‑picture wrapper
  let profilePicClass =
    'absolute z-10 overflow-hidden left-[3px] top-[3px] transition-all duration-500 ease-in-out'
  let profilePicStyle: React.CSSProperties = {}

  if (isCardHovered) {
    profilePicClass +=
      ' w-[100px] h-[100px] top-[5.5%] left-[5.5%] rounded-full border-[7px] border-[#b8bac0] z-30 shadow-[3px_3px_8px_#b8bac0,-3px_-3px_8px_#ffffff]'
    if (isImgHovered) {
      profilePicClass += ' z-40'
      profilePicStyle = {
        transform: 'scale(1.3)',
        borderRadius: '10px',
        transition: 'all 0.5s ease-in-out, z-index 0.5s ease-in-out 0.1s',
      }
    }
  } else {
    profilePicClass +=
      ' w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-[29px] rounded-tr-none'
  }

  // Image
  const imgClass =
    'object-cover w-full h-full object-[0px_0px] transition-all duration-500 '

  return (
    <div
      className={`relative w-[280px] h-[280px] bg-[#e0e5ec] rounded-[32px] rounded-tr-none p-[3px] flex flex-col items-center transition-all duration-500 ease-in-out
        ${isCardHovered ? 'rounded-tl-[55px] shadow-[inset_6px_6px_12px_#b8bac0,inset_-6px_-6px_12px_#ffffff]' : ''}`}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false)
        setIsImgHovered(false)
      }}
    >
      {/* Mail button */}
      <a
        href={email ? `mailto:${email}` : '#'}
        className="absolute right-6 top-4 bg-[#e0e5ec] rounded-full p-2 shadow-[2px_2px_4px_#b8bac0,-2px_-2px_4px_#ffffff] z-20 transition-all duration-200 hover:scale-110"
        aria-label="Send Email"
        tabIndex={-1}
        style={{ pointerEvents: 'auto' }}
      >
        <Mail
          size={24}
          strokeWidth={2.2}
          style={{
            stroke: isCardHovered ? '#8b5cf6' : '#b8bac0',
            transition: 'stroke 0.2s',
          }}
        />
      </a>

      {/* Profile picture */}
      <div
        className={profilePicClass}
        style={profilePicStyle}
        onMouseEnter={() => isCardHovered && setIsImgHovered(true)}
        onMouseLeave={() => setIsImgHovered(false)}
      >
        <img src={imageUrl} alt={name} className={imgClass} />
      </div>

      {/* Bottom card */}
      <div className={`
        absolute bottom-[3px] left-[3px] right-[3px]
        bg-[#e0e5ec]  rounded-[29px] z-20
        shadow-[inset_2px_2px_8px_#b8bac0,inset_-2px_-2px_8px_#ffffff]
        overflow-hidden
        transition-all duration-500 ease-[cubic-bezier(0.645,0.045,0.355,1)]
        ${isCardHovered ? 'top-[25%] rounded-[80px_29px_29px_29px]' : 'top-[80%]'}`}
      >
        <div className="absolute bottom-0 left-6 right-6 h-[160px]">
          <span className="block text-[1.2rem] text-[#444] mt-2 font-bold">{name}</span>
          <span className="block text-[0.9rem] text-[#888] mt-3">{about}</span>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between">
          {/* Social icons */}
          <div className="flex gap-4">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bg-accent-mystic rounded-full p-2 shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] transition-all duration-200 hover:scale-110"
              >
                {/* Instagram SVG */}
                <svg viewBox="0 0 16 15.999" height="20" width="20" fill="#888" className="hover:fill-[#6c63ff] transition-all">
                  <path transform="translate(6 598)" d="M6-582H-2a4,4,0,0,1-4-4v-8a4,4,0,0,1,4-4H6a4,4,0,0,1,4,4v8A4,4,0,0,1,6-582ZM2-594a4,4,0,0,0-4,4,4,4,0,0,0,4,4,4,4,0,0,0,4-4A4.005,4.005,0,0,0,2-594Zm4.5-2a1,1,0,0,0-1,1,1,1,0,0,0,1,1,1,1,0,0,0,1-1A1,1,0,0,0,6.5-596ZM2-587.5A2.5,2.5,0,0,1-.5-590,2.5,2.5,0,0,1,2-592.5,2.5,2.5,0,0,1,4.5-590,2.5,2.5,0,0,1,2-587.5Z"></path>
                </svg>
              </a>
            )}

            {/* Twitter */}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="accent-mystic rounded-full p-2 shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] transition-all duration-200 hover:scale-110"
              >
                <svg viewBox="0 0 512 512" width="20" height="20" fill="#888" className="hover:fill-[#6c63ff] transition-all">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                </svg>
              </a>
            )}

            {/* Github */}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github"
                className="bg-accent-mystic rounded-full p-2 shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] transition-all duration-200 hover:scale-110"
              >
                <svg viewBox="0 0 496 512" width="20" height="20" fill="#888" className="hover:fill-pink-400 transition-all">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
                </svg>
              </a>
            )}

            {/* Linkedin */}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Linkedin"
                className="bg-accent-mystic rounded-full p-2 shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] transition-all duration-200 hover:scale-110"
              >
                <svg viewBox="0 0 448 512" width="20" height="20" fill="#888" className="hover:fill-blue-500 transition-all">
                  <path d="M100.28 448H7.4V148.9h92.88zm-46.44-340.7C24.12 107.3 0 83.18 0 53.6 0 24.5 24.12 0 53.84 0c29.72 0 53.84 24.5 53.84 53.6 0 29.58-24.12 53.7-53.84 53.7zM447.8 448h-92.36V302.4c0-34.7-12.4-58.4-43.4-58.4-23.7 0-37.8 16-44 31.4-2.3 5.5-2.9 13.2-2.9 20.9V448h-92.4s1.2-241.2 0-266.1h92.4v37.7c12.3-19 34.4-46.1 83.7-46.1 61.1 0 106.9 39.8 106.9 125.4V448z" />
                </svg>
              </a>
            )}
          </div>

          <button className="bg-accent-mystic text-violet-500 rounded-[20px] text-xs px-3 py-1 shadow-[2px_2px_6px_#b8bac0,-2px_-2px_6px_#ffffff] border-none transition-all duration-200 hover:bg-gradient-to-r from-violet-400 to-purple-400 hover:text-white">
            Contact Me
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────
   PAGE COMPONENT
───────────────────────── */
export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-accent-first via-accent-second to-accent-third flex flex-col items-center py-12">
      <h1 className="text-3xl font-extrabold text-[#6c63ff] mb-14 tracking-tight">Meet Our Team</h1>

      {/* Office Bearers */}
      <section className="w-full flex flex-col items-center mb-16">
        <h2 className="text-2xl font-bold text-gradient mb-8">Office Bearers</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {OFFICE_BEARERS.map((member, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <TeamCard {...member} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Development Team */}
      <section className="w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gradient mb-8">Development Team</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {DEV_TEAM.map((member, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <TeamCard {...member} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
