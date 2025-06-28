'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type ErrorMessage = { id: number; message: string }
const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

export default function AlumniRegister() {
  const [form, setForm] = useState({
    rollNumber: '',
    company: '',
    role: '',
    photo: null as File | null,
  })
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [timer, setTimer] = useState(OTP_TIMEOUT)
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId] = useState(0)

  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const mobile = searchParams.get('mobile') || ''
  const name = searchParams.get('name') || ''
  const email = searchParams.get('email') || ''

  // Notification timer
  useEffect(() => {
    const timers = errorList.map(err =>
      setTimeout(() => setErrorList(prev => prev.filter(e => e.id !== err.id)), 4000)
    )
    return () => timers.forEach(clearTimeout)
  }, [errorList])

  // Countdown timer for OTP
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const countdown = setTimeout(() => setTimer(prev => prev - 1), 1000)
      return () => clearTimeout(countdown)
    }
  }, [isOtpSent, timer])

  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validate = () => {
    let isValid = true
    const { rollNumber, company, role, photo } = form
    if (!rollNumber.trim()) showError('Roll number is required'), isValid = false
    if (!company.trim()) showError('Current company is required'), isValid = false
    if (!role.trim()) showError('Role is required'), isValid = false
    if (!photo) showError('Photo upload is required'), isValid = false
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setForm(prev => ({ ...prev, photo: file }))
  }

  const sendOtp = async () => {
    try {
      await fetch('http://localhost:3000/auth/sendMobileOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
    } catch {
      showError('Failed to send OTP. Try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOtpSent && validate()) {
      await sendOtp()
      setIsOtpSent(true)
      setTimer(OTP_TIMEOUT)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  const verifyOtp = async () => {
    const enteredOtp = otp.join('')
    if (enteredOtp.length < OTP_LENGTH) {
      showError('Enter complete 4-digit OTP')
      return
    }

    try {
      const verifyRes = await fetch('http://localhost:3000/auth/authMobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: enteredOtp }),
      })
      const result = await verifyRes.json()
      if (!verifyRes.ok || !result.refreshToken) throw new Error()

      // OTP success → save alumni data
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('mobile', mobile)
      formData.append('studentType', 'alumni')
      formData.append('rollNumber', form.rollNumber)
      formData.append('company', form.company)
      formData.append('role', form.role)
      if (form.photo) formData.append('photo', form.photo)

      const saveRes = await fetch('http://localhost:3000/user/', {
        method: 'POST',
        body: formData,
      })
      if (!saveRes.ok) throw new Error()
      router.push('/')
    } catch {
      showError('Incorrect OTP or failed to save details')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 sm:px-6 py-10 pt-24 relative">
      {/* Notifications */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-sm">
        {errorList.map(err => (
          <div key={err.id} className="bg-danger text-white px-4 py-2 rounded shadow text-sm animate-fade-in-out">
            {err.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-primary-100 p-6 rounded-lg shadow-md w-full max-w-md space-y-5 text-white">
        <h2 className="text-2xl font-bold text-center">Alumni Details</h2>

        {!isOtpSent ? (
          <>
            <input name="rollNumber" placeholder="Roll Number" onChange={handleChange}
              className="w-full p-3 rounded bg-background text-white" />
            <input name="company" placeholder="Current Company" onChange={handleChange}
              className="w-full p-3 rounded bg-background text-white" />
            <input name="role" placeholder="Role" onChange={handleChange}
              className="w-full p-3 rounded bg-background text-white" />
            <label className="block">
              <span className="text-sm font-medium">Upload Alumni Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="w-full mt-2 p-3 rounded bg-background text-white" />
            </label>

            <button type="submit" className="w-full bg-accent hover:bg-accent-hover py-3 rounded font-semibold">
              Submit & Send OTP
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-sm">OTP sent to <strong>{mobile}</strong></p>
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  ref={(el) => (otpInputsRef.current[i] = el)}
                  className="w-14 h-14 text-xl text-center rounded bg-white text-black"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-200">{timer > 0 ? `Resend OTP in ${timer}s` : 'Didn’t get it?'}</span>
              <button
                type="button"
                className={`text-blue-400 ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={timer > 0}
                onClick={async () => {
                  await sendOtp()
                  setTimer(OTP_TIMEOUT)
                }}
              >
                Resend OTP
              </button>
            </div>

            <button type="button" onClick={verifyOtp} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold">
              Verify OTP & Submit
            </button>
          </>
        )}
      </form>

      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out { animation: fade-in-out 4s ease forwards; }
      `}</style>
    </div>
  )
}
