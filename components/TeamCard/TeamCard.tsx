'use client'
import TeamCardFooter from "./TeamCardFooter"
import { useState } from "react"
import { Mail } from 'lucide-react'

export default function TeamCard({
  name,
  about,
  imageUrl,
  email,
  socials = {},
}: {
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
}) {
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isImgHovered, setIsImgHovered] = useState(false)
    // fetch("/", {
    //     next: {
    //         revalidate:60*60*24
    //     }
    // })
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
{/* TODO: change below toserver component */}
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
        <TeamCardFooter name={name} about={about} socials={socials} />
      </div>
    </div>
  )
}