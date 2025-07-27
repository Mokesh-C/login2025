'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showLogo?: boolean
}

// Animated SVG LOGIN 2025 Logo Component
function AnimatedLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-32 h-16',
    md: 'w-48 h-24',
    lg: 'w-64 h-32'
  }

  return (
    <motion.svg
      viewBox="0 0 400 100"
      className={sizeClasses[size]}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* LOGIN text with gradient and animations */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* LOGIN letters with individual animations */}
      {['L', 'O', 'G', 'I', 'N'].map((letter, index) => (
        <motion.text
          key={letter}
          x={60 + index * 55}
          y="45"
          fontSize="32"
          fontWeight="900"
          fill="url(#logoGradient)"
          filter="url(#glow)"
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        >
          {letter}
        </motion.text>
      ))}

      {/* 2025 with pulse animation */}
      <motion.text
        x="200"
        y="75"
        fontSize="20"
        fontWeight="700"
        fill="#ffffff"
        textAnchor="middle"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [0.95, 1, 0.95]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        2025
      </motion.text>

      {/* Animated underline */}
      <motion.line
        x1="50"
        y1="85"
        x2="350"
        y2="85"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  )
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  showLogo = true
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Custom LOGIN 2025 animated loading */}
      <div className="relative">
        {/* Lottie and LOGIN on same line - responsive layout */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Lottie Animation - responsive size */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
            <Lottie
              animationData={require('../public/lottie/login.json')}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {/* LOGIN and 2025 text - responsive text sizes */}
          <div className="flex flex-col">
            {/* Animated letters */}
            <div className="flex space-x-1 sm:space-x-2">
              {['L', 'O', 'G', 'I', 'N'].map((letter, index) => (
                <motion.div
                  key={letter}
                  className="text-white font-black text-2xl sm:text-3xl md:text-4xl tracking-wider font-inter"
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.2, 1],
                    color: ['#ffffff', '#a855f7', '#ffffff']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "easeInOut"
                  }}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
            
            {/* Animated 2025 */}
            <motion.div
              className="mt-2"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-purple-300 font-bold text-lg sm:text-xl md:text-2xl tracking-wide font-inter">2025</span>
            </motion.div>
            
            {/* Animated underline below 2025 */}
            <motion.div
              className="mt-2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

// Full screen loading component with custom animation
export function FullScreenLoader({ text = 'Loading LOGIN 2025...' }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent-first via-accent-second to-accent-third"
    >
      <div className="text-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Custom loading animation */}
        <LoadingSpinner size="lg" text={text} showLogo={false} />
      </div>
    </motion.div>
  )
}

// Inline loading component
export function InlineLoader({ size = 'sm', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size={size} text={text} showLogo={false} />
    </div>
  )
}

// Page loading component (doesn't cover header)
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-accent-first via-accent-second to-accent-third">
      <div className="text-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Custom loading animation */}
        <LoadingSpinner size="lg" text={text} showLogo={false} />
      </div>
    </div>
  )
}

// Lottie Loading Component (for future use)
export function LottieLoader({ lottieData, size = 'lg' }: { lottieData: any, size?: 'sm' | 'md' | 'lg' }) {
  // To use this, first install: npm install lottie-react
  // Then import: import Lottie from 'lottie-react'
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      {/* 
        Replace this with actual Lottie component:
        <Lottie
          animationData={lottieData}
          loop={true}
          autoplay={true}
        />
      */}
      <div className="text-white">Lottie Animation Placeholder</div>
    </div>
  )
}