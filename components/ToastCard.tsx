'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ToastProps {
  id: number
  message: string
  onClose: () => void
  textColor?: string // e.g., "text-red-700"
}

export default function ToastCard({
  id,
  message,
  onClose,
  textColor = 'text-red-900',
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 700, damping: 30 } }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
      className={`fixed right-4 top-16 z-50 w-[90%] sm:w-full sm:max-w-sm rounded-md
                  bg-white/50 px-4 py-3 shadow-xl backdrop-blur-md ${textColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium break-words">{message}</span>
        <button
          aria-label="Close"
          onClick={onClose}
          className="text-black/40 hover:text-black"
        >
          <X size={16} />
        </button>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className="mt-2 h-1 rounded bg-black/20"
      />
    </motion.div>
  )
}
