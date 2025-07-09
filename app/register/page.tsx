'use client'

/* ──────────────────────────────────────────────────────────
   PARTICIPANT REGISTER  –  3‑step animated flow
   Steps:
   0. General Info  →  Send OTP
   1. OTP Verification
   2. Detailed Info  →  Submit
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  School,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import Image from 'next/image'
import ToastCard from '@/components/ToastCard'

/* ─── constants ─── */
const OTP_LENGTH  = 4
const OTP_TIMEOUT = 60
const STEPS       = { GENERAL: 0, OTP: 1, DETAILS: 2 } as const

/* ─── types ─── */
type ErrorMessage = { id: number; message: string }
type College      = { Name: string }

export default function ParticipantRegister() {
  /* ---------- full form state ---------- */
  const [form, setForm] = useState({
    /* step‑0 */
    name          : '',
    email         : '',
    mobile        : '',
    gender        : '',
    /* step‑2 */
    college       : '',
    degree        : '',
    specialization: '',
    year          : '',
    foodPreference: '',
    accommodation : '',
    photo         : null as File | null,
  })

  /* ---------- other state ---------- */
  const [step, setStep]             = useState<typeof STEPS[keyof typeof STEPS]>(STEPS.GENERAL)
  const [allColleges, setAll]       = useState<College[]>([])
  const [suggestions, setSuggestions] = useState<College[]>([])
  const [otp, setOtp]               = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer]           = useState(OTP_TIMEOUT)
  const [errorList, setErrorList]   = useState<ErrorMessage[]>([])
  const [errorId,  setErrorId]      = useState(0)

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])
  const router       = useRouter()

  /* ── fetch college list once ── */
  useEffect(() => {
    fetch('/colleges.json')
      .then(r => r.json())
      .then(data => {
        if (data?.value) setAll(data.value.map((c: string) => ({ Name: c })))
      })
      .catch(console.error)
  }, [])

  /* ── OTP countdown when on OTP step ── */
  useEffect(() => {
    if (step === STEPS.OTP && timer > 0) {
      const t = setTimeout(() => setTimer(p => p - 1), 1_000)
      return () => clearTimeout(t)
    }
  }, [step, timer])

  /* ── auto‑dismiss toasts ── */
  useEffect(() => {
    const tids = errorList.map(e =>
      setTimeout(() => setErrorList(prev => prev.filter(t => t.id !== e.id)), 4_000)
    )
    return () => tids.forEach(clearTimeout)
  }, [errorList])

  /* ── helpers ── */
  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const showSuccess = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }
  
  /* ── validation per step ── */
  const validateGeneral = () => {
    const { name, email, mobile, gender } = form
    let ok = true
    if (!name.trim())  showError('Name is required'),                        ok = false
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) showError('Invalid email'),                 ok = false
    if (!/^\d{10}$/.test(mobile)) showError('Mobile must be 10 digits'),   ok = false
    if (!gender)            showError('Select gender'),                      ok = false
    return ok
  }

  const validateDetails = () => {
    const {
      college, degree, specialization,
      year, foodPreference, accommodation, photo,
    } = form
    let ok = true
    if (!college.trim())        showError('College name is required'),       ok = false
    if (!degree)               showError('Select degree'),                  ok = false
    if (!specialization.trim()) showError('Specialization required'),       ok = false
    if (!year)                 showError('Select year'),                    ok = false
    if (!foodPreference)       showError('Select food preference'),         ok = false
    if (!accommodation)        showError('Select accommodation'),           ok = false
    if (!photo)                showError('Photo upload required'),          ok = false
    return ok
  }

  /* ── input handlers ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    /* autocomplete for college */
    if (name === 'college') {
      const filtered = allColleges.filter(c =>
        c.Name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(value ? filtered.slice(0, 10) : [])
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }))

  /* ── OTP handling ── */
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const arr = [...otp]
    arr[idx] = val
    setOtp(arr)
    if (val && idx < OTP_LENGTH - 1) otpInputsRef.current[idx + 1]?.focus()
  }

  const sendOtp = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          name  : form.name,
          mobile: form.mobile,
          email : form.email,
          gender: form.gender,
        }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        showError(data?.message || 'Failed to send OTP')
        return false
      }
      
      // ✅ Success
      showSuccess('OTP sent successfully')
      return true
  
    } catch (err) {
      console.error('❌ Error sending OTP:', err)
      showError('Failed to send OTP')
      return false
    }
  }
  

  /* ── step 0 submit → send OTP ── */
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateGeneral()) return
    try {
      await sendOtp()
      setTimer(OTP_TIMEOUT)
      setStep(STEPS.OTP)
    } catch {
      showError('Failed to send OTP')
    }
  }

  /* ── step 1 verify OTP ── */
  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) return showError('Enter full OTP')
  
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/authMobile`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ mobile: form.mobile, otp: code }),
      })
  
      const j = await r.json()
  
      if (!r.ok || !j.refreshToken) {
        showError(j?.message || 'Invalid OTP')
        return
      }
  
      // ✅ OTP Verified
      showSuccess('OTP Verified Successfully')
      setStep(STEPS.DETAILS)
  
    } catch (err) {
      console.error('❌ Error verifying OTP:', err)
      showError('Something went wrong while verifying OTP')
    }
  }

  /* ── step 2 submit full form ── */
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDetails()) return

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) =>
      v !== null && fd.append(k, v as any)
    )
    fd.append('studentType', 'participant')

    try {
      await fetch('http://localhost:3000/user/', { method: 'POST', body: fd })
      router.push('/')
    } catch {
      showError('Submission failed')
    }
  }

  const removeToast = useCallback(
    (id: number) => setErrorList(prev => prev.filter(t => t.id !== id)),
    []
  )

  /* ─── UI ─── */
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* LEFT promo panel */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center px-10">
        <Image src="/logo.png" alt="Login Logo" width={480} height={240} className="mb-6" />
        <h1 className="mb-4 text-center text-4xl font-extrabold leading-tight">
          Welcome to LOGIN 2025
        </h1>
        <p className="max-w-md text-center text-lg text-white/80">
          Participant registration – showcase your skills at the 34<sup>th</sup> edition of our
          national‑level symposium!
        </p>
      </div>

      {/* RIGHT form panel */}
      <div className="relative flex w-full items-center justify-center px-4 py-12 sm:px-6 md:w-1/2">
        {/* Toasts */}
        <AnimatePresence>
            {errorList.map(e => (
                <ToastCard
                key={e.id}
                id={e.id}
                message={e.message}
                onClose={() => removeToast(e.id)}
                textColor={
                    e.message.toLowerCase().includes('otp sent') ||
                    e.message.toLowerCase().includes('success')
                    ? 'text-green-400'
                    : 'text-red-500'
                }
                />
            ))}
        </AnimatePresence>

        {/* Glass card */}
        <motion.form
          onSubmit={
            step === STEPS.GENERAL
              ? handleGeneralSubmit
              : step === STEPS.DETAILS
                ? handleFinalSubmit
                : undefined /* OTP step uses buttons */
          }
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md overflow-hidden rounded-md border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          {/* step headings */}
          <h2 className="mb-3 text-center text-3xl font-extrabold">
            {step === STEPS.GENERAL && 'Basic Details'}
            {step === STEPS.OTP     && 'Verify OTP'}
            {step === STEPS.DETAILS && 'Participant Details'}
          </h2>

          {/* ───────────────── STEP 0 ‑ GENERAL ──────────────── */}
          <AnimatePresence mode="wait" initial={false}>
            {step === STEPS.GENERAL && (
              <motion.div
                key="general"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <GlassInput
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                />
                <GlassInput
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
                <GlassInput
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                />
                <GlassSelect
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={['Male', 'Female', 'Other']}
                  placeholder="Select Gender"
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  Send OTP
                </button>
              </motion.div>
            )}

            {/* ───────────────── STEP 1 ‑ OTP ──────────────── */}
            {step === STEPS.OTP && (
              <motion.div
                key="otp"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <p className="text-center text-sm">
                  Enter the {OTP_LENGTH}-digit OTP sent to <strong>{form.mobile}</strong>
                </p>

                <div className="flex justify-between gap-2">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      ref={(el) => {
                        otpInputsRef.current[i] = el
                      }}
                      className="h-14 w-14 rounded bg-white/25 text-center text-xl text-black"
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
                    onClick={async () => {
                      await sendOtp()
                      setTimer(OTP_TIMEOUT)
                    }}
                    className={timer > 0 ? 'cursor-not-allowed opacity-50' : 'text-blue-400'}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={verifyOtp}
                  className="w-full rounded-md bg-green-600 py-3 font-semibold transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                >
                  Verify OTP
                </button>
              </motion.div>
            )}

            {/* ───────────────── STEP 2 ‑ DETAILS ──────────────── */}
            {step === STEPS.DETAILS && (
              <motion.div
                key="details"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* College autocomplete */}
                <div className="relative">
                  <GlassInput
                    icon={<School size={18} />}
                    name="college"
                    placeholder="College Name"
                    value={form.college}
                    onChange={handleChange}
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute left-0 top-full z-20 max-h-40 w-full overflow-auto rounded bg-white text-black shadow">
                      {suggestions.map((c, i) => (
                        <li
                          key={i}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                          onClick={() => {
                            setForm(p => ({ ...p, college: c.Name }))
                            setSuggestions([])
                          }}
                        >
                          {c.Name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <GlassSelect
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  options={['M.E.', 'MCA', 'MBA', 'M.Sc.', 'M.Tech.', 'M.Com.', 'M.A.']}
                  placeholder="Select Degree"
                />

                <GlassInput
                  name="specialization"
                  placeholder="Specialization"
                  value={form.specialization}
                  onChange={handleChange}
                />

                <GlassSelect
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  options={['I', 'II', 'III', 'IV']}
                  placeholder="Select Year"
                />

                <GlassSelect
                  name="foodPreference"
                  value={form.foodPreference}
                  onChange={handleChange}
                  options={['VEG', 'NON-VEG']}
                  placeholder="Food Preference"
                />

                <GlassSelect
                  name="accommodation"
                  value={form.accommodation}
                  onChange={handleChange}
                  options={['YES', 'NO']}
                  placeholder="Accommodation"
                />

                {/* Photo upload */}
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <ImageIcon size={18} />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="block w-full cursor-pointer rounded-md bg-white/10 py-3 pl-10 pr-4 text-sm text-white file:border-0 file:bg-transparent file:text-white/70 placeholder:text-white/50 backdrop-blur-md"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  Submit Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  )
}

/* ─── REUSABLE GLASS INPUT / SELECT ─── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode
}
function GlassInput({ icon, ...rest }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
          {icon}
        </span>
      )}
      <input
        {...rest}
        className={`w-full rounded-md bg-white/10 py-3 ${icon ? 'pl-10' : 'px-4'} pr-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent`}
      />
    </div>
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[]
  placeholder: string
}
function GlassSelect({ options, placeholder, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        className="w-full appearance-none rounded-md bg-white/10 py-3 px-4 text-sm text-white outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map(o => (
          <option key={o} value={o} className="bg-primary text-white">
            {o}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
