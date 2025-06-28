'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type ErrorMessage = { id: number; message: string }
type College = { Name: string }

const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

export default function ParticipantRegister() {
  const [form, setForm] = useState({
    college: '',
    degree: '',
    specialization: '',
    year: '',
    foodPreference: '',
    accommodation: '',
    photo: null as File | null,
  })

  const [allColleges, setAllColleges] = useState<College[]>([])
  const [suggestions, setSuggestions] = useState<College[]>([])
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer] = useState(OTP_TIMEOUT)
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId] = useState(0)

  const otpInputsRef = useRef<HTMLInputElement[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const mobile = searchParams.get('mobile') || ''
  const name = searchParams.get('name') || ''
  const email = searchParams.get('email') || ''

  // College API
  useEffect(() => {
    fetch('/colleges.json')
      .then(res => res.json())
      .then(data => {
        if (data?.value) setAllColleges(data.value.map((c: string) => ({ Name: c })))
      })
      .catch(console.error)
  }, [])

  // OTP countdown
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const t = setTimeout(() => setTimer(prev => prev - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timer, isOtpSent])

  // Error message auto-dismiss
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

  const validate = () => {
    const { college, degree, specialization, year, foodPreference, accommodation, photo } = form
    let isValid = true
    if (!college.trim()) showError('College name is required'), isValid = false
    if (!degree.trim()) showError('Degree is required'), isValid = false
    if (!specialization.trim()) showError('Specialization is required'), isValid = false
    if (!year) showError('Year must be selected'), isValid = false
    if (!foodPreference) showError('Select food preference'), isValid = false
    if (!/^[1-9]\d*$/.test(accommodation)) showError('Accommodation must be a number'), isValid = false
    if (!photo) showError('Photo upload is required'), isValid = false
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'college') {
      const filtered = allColleges.filter(c => c.Name.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(value ? filtered.slice(0, 10) : [])
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        await fetch('http://localhost:3000/auth/sendMobileOTP', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile }),
        })
        setIsOtpSent(true)
        setTimer(OTP_TIMEOUT)
      } catch {
        showError('Failed to send OTP')
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < OTP_LENGTH - 1) otpInputsRef.current[index + 1]?.focus()
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) return showError('Enter full OTP')
    try {
      const res = await fetch('http://localhost:3000/auth/authMobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code }),
      })
      const json = await res.json()
      if (!res.ok || !json.refreshToken) throw new Error()

      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('mobile', mobile)
      fd.append('studentType', 'participant')
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, v as any)
      })

      await fetch('http://localhost:3000/user/', {
        method: 'POST',
        body: fd,
      })

      router.push('/')
    } catch {
      showError('Invalid OTP or submission failed')
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
        <h2 className="text-2xl font-bold text-center">Participant Details</h2>

        {!isOtpSent ? (
          <>
            {/* College Autocomplete */}
            <div className="relative">
              <input
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="College Name"
                className="w-full p-3 rounded bg-background text-white"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 bg-white text-black w-full rounded shadow max-h-40 overflow-auto">
                  {suggestions.map((c, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setForm(prev => ({ ...prev, college: c.Name }))
                        setSuggestions([])
                      }}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {c.Name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select name="degree" onChange={handleChange} className="w-full p-3 rounded bg-background text-white">
              <option value="">Select Degree</option>
              {['M.E.', 'MCA', 'M.Sc.', 'M.Tech.', 'M.Com.', 'M.A.'].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <input
              name="specialization"
              placeholder="Specialization"
              onChange={handleChange}
              className="w-full p-3 rounded bg-background text-white"
            />

            <select name="year" onChange={handleChange} className="w-full p-3 rounded bg-background text-white">
              <option value="">Select Year</option>
              {['I', 'II', 'III', 'IV'].map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>

            <select name="foodPreference" onChange={handleChange} className="w-full p-3 rounded bg-background text-white">
              <option value="">Food Preference</option>
              {['VEG', 'NON-VEG'].map(fp => (
                <option key={fp}>{fp}</option>
              ))}
            </select>

            <input
              name="accommodation"
              placeholder="Accommodation Count"
              type="number"
              onChange={handleChange}
              className="w-full p-3 rounded bg-background text-white"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full p-3 rounded bg-background text-white"
            />

            <button type="submit" className="w-full py-3 bg-accent hover:bg-accent-hover rounded font-semibold">
              Submit & Send OTP
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-sm">Enter the 4-digit OTP sent to <strong>{mobile}</strong></p>
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

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-200">
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Didn’t get it?'}
              </span>
              <button
                type="button"
                className={`text-blue-400 ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={timer > 0}
                onClick={async () => {
                  await fetch('http://localhost:3000/auth/sendMobileOTP', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile }),
                  })
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
        .animate-fade-in-out {
          animation: fade-in-out 4s ease forwards;
        }
      `}</style>
    </div>
  )
}
