'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, School, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

/* ─── Types ─── */
type ErrorMessage = { id: number; message: string }
type College      = { Name: string }

const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

/* ─── Component ─── */
export default function ParticipantRegister() {
  /* ---------- form state ---------- */
  const [form, setForm] = useState({
    college: '',
    degree: '',
    specialization: '',
    year: '',
    foodPreference: '',
    accommodation: '',
    photo: null as File | null,
  })

  const [allColleges, setAllColleges]   = useState<College[]>([])
  const [suggestions, setSuggestions]   = useState<College[]>([])
  const [isOtpSent, setIsOtpSent]       = useState(false)
  const [otp, setOtp]                   = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer]               = useState(OTP_TIMEOUT)
  const [errorList, setErrorList]       = useState<ErrorMessage[]>([])
  const [errorId, setErrorId]           = useState(0)

  const otpInputsRef = useRef<HTMLInputElement[]>([])

  const router       = useRouter()
  const searchParams = useSearchParams()
  const mobile       = searchParams.get('mobile') ?? ''
  const name         = searchParams.get('name')   ?? ''
  const email        = searchParams.get('email')  ?? ''

  /* ---------- fetch colleges ---------- */
  useEffect(() => {
    fetch('/colleges.json')
      .then(r => r.json())
      .then(data => {
        if (data?.value) setAllColleges(data.value.map((c: string) => ({ Name: c })))
      })
      .catch(console.error)
  }, [])

  /* ---------- OTP countdown ---------- */
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const t = setTimeout(() => setTimer(p => p - 1), 1_000)
      return () => clearTimeout(t)
    }
  }, [isOtpSent, timer])

  /* ---------- auto‑dismiss toasts ---------- */
  useEffect(() => {
    const timers = errorList.map(err =>
      setTimeout(() => setErrorList(prev => prev.filter(e => e.id !== err.id)), 4_000)
    )
    return () => timers.forEach(clearTimeout)
  }, [errorList])

  /* ---------- helpers ---------- */
  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validate = () => {
    const { college, degree, specialization, year, foodPreference, accommodation, photo } = form
    let ok = true
    if (!college.trim())         showError('College name is required'),        ok = false
    if (!degree.trim())          showError('Degree is required'),             ok = false
    if (!specialization.trim())  showError('Specialization is required'),     ok = false
    if (!year)                   showError('Year must be selected'),          ok = false
    if (!foodPreference)         showError('Select food preference'),         ok = false
    if (!['YES', 'NO'].includes(accommodation)) showError('Select accommodation option'), ok = false
    if (!photo)                  showError('Photo upload is required'),       ok = false
    return ok
  }

  /* ---------- handlers ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))

    if (name === 'college') {
      const filtered = allColleges.filter(c =>
        c.Name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(value ? filtered.slice(0, 10) : [])
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, photo: e.target.files?.[0] ?? null }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

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

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\\d?$/.test(val)) return
    const n = [...otp]
    n[idx] = val
    setOtp(n)
    if (val && idx < OTP_LENGTH - 1) otpInputsRef.current[idx + 1]?.focus()
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) return showError('Enter full OTP')

    try {
      const r = await fetch('http://localhost:3000/auth/authMobile', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ mobile, otp: code }),
      })
      const j = await r.json()
      if (!r.ok || !j.refreshToken) throw new Error()

      /* send full form */
      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('mobile', mobile)
      fd.append('studentType', 'participant')
      Object.entries(form).forEach(([k, v]) => v !== null && fd.append(k, v as any))

      await fetch('http://localhost:3000/user/', { method: 'POST', body: fd })
      router.push('/')
    } catch { showError('Invalid OTP or submission failed') }
  }

  const removeToast = useCallback(
    (id: number) => setErrorList(prev => prev.filter(t => t.id !== id)),
    []
  )

  /* ---------- UI ---------- */
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* LEFT COLUMN */}
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

      {/* RIGHT COLUMN */}
      <div className="relative flex w-full items-center justify-center px-4 py-12 sm:px-6 md:w-1/2">
        {/* ───── Error Toasts ───── */}
        <AnimatePresence>
          {errorList.map(e => (
            <ErrorToast
              key={e.id}
              id={e.id}
              message={e.message}
              onClose={() => removeToast(e.id)}
            />
          ))}
        </AnimatePresence>

        {/* ───── Glass Card ───── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="mb-3 text-center text-3xl font-extrabold">Participant Details</h2>

          {/* -------- first step -------- */}
          {!isOtpSent && (
            <>
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
                options={['M.E.', 'MCA', 'M.Sc.', 'M.Tech.', 'M.Com.', 'M.A.']}
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

              {/* File upload */}
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
                className="w-full rounded-lg bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Submit & Send OTP
              </button>
            </>
          )}

          {/* -------- OTP step -------- */}
          {isOtpSent && (
            <>
              <p className="text-center  text-sm">
                Enter the {OTP_LENGTH}-digit OTP sent to <strong>{mobile}</strong>
              </p>

              <div className="flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    ref={el => (otpInputsRef.current[i] = el)}
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
                  className={`${
                    timer > 0 ? 'cursor-not-allowed opacity-50' : 'text-blue-400'
                  }`}
                  onClick={async () => {
                    await fetch('http://localhost:3000/auth/sendMobileOTP', {
                      method : 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body   : JSON.stringify({ mobile }),
                    })
                    setTimer(OTP_TIMEOUT)
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="button"
                onClick={verifyOtp}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                Verify OTP & Submit
              </button>
            </>
          )}
        </motion.form>
      </div>
    </div>
  )
}

/* ─── Reusable Glass Inputs & Selects ─── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement>
function GlassInput(props: InputProps) {
  return (
    <input
      {...props}
      className="w-full rounded-md bg-white/10 py-3 px-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
    />
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
          {options.map((o) => (
            <option
              key={o}
              value={o}
              className="bg-primary text-white"
            >
              {o}
            </option>
          ))}
        </select>
  
        {/* Custom dropdown arrow */}
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

/* ─── Error Toast ─── */
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
    const t = setTimeout(onClose, 4_000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ x: 300, y: -100, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 700, damping: 30 } }}
      exit={{ x: 300, y: -100, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
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
