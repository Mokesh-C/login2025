'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  mobile: string
  onVerified: () => void
}

const OTP_LENGTH = 4

export default function OtpVerification({ mobile, onVerified }: Props) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [errorMsg, setErrorMsg] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error'>('idle')
  const [countdown, setCountdown] = useState(60)
  const otpRefs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'idle' && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown, status])

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus()
      }
    }
  }

  const sendOTP = async () => {
    try {
      setStatus('sending')
      const res = await fetch('http://localhost:3000/auth/sendMobileOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      if (!res.ok) throw new Error()
      setStatus('idle')
      setCountdown(60)
      setErrorMsg('')
    } catch {
      setStatus('error')
      setErrorMsg('Failed to send OTP. Try again later.')
    }
  }

  const verifyOTP = async () => {
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== OTP_LENGTH) {
      setErrorMsg('Enter the full 4-digit OTP.')
      return
    }

    try {
      setStatus('verifying')
      const res = await fetch('http://localhost:3000/auth/authMobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: enteredOtp }),
      })

      const result = await res.json()
      if (res.ok && result.refreshToken) {
        setStatus('success')
        onVerified()
      } else {
        setStatus('error')
        setErrorMsg('Incorrect OTP. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Verification failed. Try again.')
    }
  }

  return (
    <div className="space-y-4 text-white">
      <p className="text-sm font-semibold text-center">Enter the 4-digit OTP pin</p>

      <div className="flex justify-between gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, i)}
            ref={(el) => {
              if (el) otpRefs.current[i] = el
            }}
            className="w-12 h-12 text-xl text-center rounded bg-white text-black"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={verifyOTP}
        disabled={status === 'verifying'}
        className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white"
      >
        {status === 'verifying' ? 'Verifying...' : 'Verify OTP'}
      </button>

      {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

      <p className="text-sm text-center mt-2">
        {countdown > 0 ? (
          `Resend OTP in ${countdown}s`
        ) : (
          <button onClick={sendOTP} type="button" className="text-blue-300 underline">
            Resend OTP
          </button>
        )}
      </p>
    </div>
  )
}
