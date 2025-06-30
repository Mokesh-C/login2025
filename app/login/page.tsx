'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

type ErrorMessage = { id: number; message: string }

export default function LoginPage() {
  const [mobile, setMobile]       = useState('')
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(''))
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [timer, setTimer]         = useState(OTP_TIMEOUT)
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId]     = useState(0)

  const otpInputsRef = useRef<HTMLInputElement[]>([])
  const router = useRouter()

  // OTP countdown
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const t = setTimeout(() => setTimer(p => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [isOtpSent, timer])

  // Error dismiss
  useEffect(() => {
    const timers = errorList.map(err =>
      setTimeout(() => setErrorList(prev => prev.filter(e => e.id !== err.id)), 4000)
    )
    return () => timers.forEach(clearTimeout)
  }, [errorList])

  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validateMobile = () => {
    if (!/^\d{10}$/.test(mobile)) {
      showError('Enter a valid 10-digit mobile number')
      return false
    }
    return true
  }

  const handleSendOtp = async () => {
    if (!validateMobile()) return

    try {
      await fetch('http://localhost:3000/auth/sendMobileOTP', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ mobile }),
      })
      setIsOtpSent(true)
      setTimer(OTP_TIMEOUT)
    } catch {
      showError('Failed to send OTP')
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const updated = [...otp]
    updated[i] = val
    setOtp(updated)
    if (val && i < OTP_LENGTH - 1) otpInputsRef.current[i + 1]?.focus()
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      showError('Enter the full 4-digit OTP')
      return
    }

    try {
      const res = await fetch('http://localhost:3000/auth/authMobile', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ mobile, otp: code }),
      })
      const data = await res.json()
      if (!res.ok || !data.refreshToken) throw new Error()
      router.push('/') // go to home or dashboard
    } catch {
      showError('Invalid OTP or login failed')
    }
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center px-10">
        <Image
          src="/logo.png"
          alt="Login Logo"
          width={480}
          height={240}
          className="mb-6"
        />        <h1 className="mb-4 text-center text-4xl font-extrabold leading-tight">
          Welcome back to LOGIN 2025
        </h1>
        <p className="max-w-md text-center text-lg text-white/80">
          Enter your mobile number to get started. Login via secure OTP verification.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-12 sm:px-6 md:w-1/2">
        {/* Error Toasts */}
        <AnimatePresence>
          {errorList.map(e => (
            <ErrorToast key={e.id} id={e.id} message={e.message} onClose={() => {
              setErrorList(prev => prev.filter(err => err.id !== e.id))
            }} />
          ))}
        </AnimatePresence>

        {/* Login Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-center text-3xl font-extrabold">Login</h2>

          {!isOtpSent ? (
            <>
              <GlassInput
                name="mobile"
                type="tel"
                maxLength={10}
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <button
                onClick={handleSendOtp}
                className="w-full rounded-lg bg-accent py-3 font-semibold hover:bg-accent-hover"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-sm">
                Enter the 4-digit OTP sent to <strong>{mobile}</strong>
              </p>

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                  key={i}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  ref={(el) => {
                    otpInputsRef.current[i] = el!
                  }}
                  className="h-14 w-14 rounded bg-white text-center text-xl text-black"
                />
                
                ))}
              </div>

              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-200">
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Didn’t get it?'}
                </span>
                <button
                  type="button"
                  disabled={timer > 0}
                  className={timer > 0 ? 'opacity-50 cursor-not-allowed' : 'text-blue-400'}
                  onClick={handleSendOtp}
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={verifyOtp}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold hover:bg-green-700"
              >
                Verify OTP & Login
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ───── GlassInput ───── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement>
function GlassInput(props: InputProps) {
  return (
    <input
      {...props}
      className="w-full rounded-md bg-white/10 py-3 px-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
    />
  )
}

/* ───── Error Toast ───── */
function ErrorToast({
  id,
  message,
  onClose,
}: {
  id: number
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ x: 300, y: 0, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ x: 300, y: 0, opacity: 0, transition: { duration: 0.4 } }}
      className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg  bg-purple-300 px-4 py-3 text-black shadow-xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button aria-label="Close" onClick={onClose} className="text-black/60 hover:text-black">
          <X size={16} />
        </button>
      </div>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className="mt-2 h-1 rounded bg-black/20"
      />
    </motion.div>
  )
}
