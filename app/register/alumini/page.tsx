'use client'

/* ──────────────────────────────────────────────────────────
   ALUMNI REGISTER  –  3‑step animated flow
   Steps:
   0. General Info  →  Send OTP
   1. OTP Verification
   2. Alumni Details  →  Submit
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IdCard,
  Building2,
  Briefcase,
  Image as ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import ToastCard from '@/components/ToastCard'

/* ─── constants ─── */
const OTP_LENGTH  = 4
const OTP_TIMEOUT = 60
const STEPS       = { GENERAL: 0, OTP: 1, DETAILS: 2 } as const

/* ─── types ─── */
type ErrorMessage = { id: number; message: string }

export default function AlumniRegister() {
  /* ---------- full form state ---------- */
  const [form, setForm] = useState({
    /* step‑0 */
    name       : '',
    mobile     : '',
    alumniCode : '',
    /* step‑2 */
    rollNumber : '',
    company    : '',
    role       : '',
    photo      : null as File | null,
  })

  /* ---------- other state ---------- */
  const [step, setStep]           = useState<typeof STEPS[keyof typeof STEPS]>(STEPS.GENERAL)
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer]         = useState(OTP_TIMEOUT)
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId,  setErrorId]    = useState(0)

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])
  const router       = useRouter()

  /* ── OTP countdown ── */
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

  /* ── validation ── */
  const validateGeneral = () => {
    const { name, mobile, alumniCode } = form
    let ok = true
    if (!name.trim())       showError('Name is required'),             ok = false
    if (!/^\d{10}$/.test(mobile)) showError('Mobile must be 10 digits'), ok = false
    if (!alumniCode.trim()) showError('Alumni code is required'),      ok = false
    return ok
  }

  const validateDetails = () => {
    const { rollNumber, company, role, photo } = form
    let ok = true
    if (!rollNumber.trim()) showError('Roll number is required'), ok = false
    if (!company.trim())    showError('Company is required'),     ok = false
    if (!role.trim())       showError('Role is required'),        ok = false
    if (!photo)             showError('Photo upload required'),   ok = false
    return ok
  }

  /* ── input handlers ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }))

  /* ── OTP input ── */
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const arr = [...otp]
    arr[idx] = val
    setOtp(arr)
    if (val && idx < OTP_LENGTH - 1) otpInputsRef.current[idx + 1]?.focus()
  }

  /* ── network helpers ── */
  const sendOtp = async () => {
    await fetch('http://localhost:3000/auth/sendMobileOTP', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ mobile: form.mobile }),
    })
  }

  /* ── step 0 submit → send OTP ── */
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateGeneral()) return
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
      const r = await fetch('http://localhost:3000/auth/authMobile', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ mobile: form.mobile, otp: code }),
      })
      const j = await r.json()
      if (!r.ok || !j.refreshToken) throw new Error()
      setStep(STEPS.DETAILS)
    } catch {
        setStep(STEPS.DETAILS)
      showError('Invalid OTP')
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
    fd.append('studentType', 'alumni')

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
          Alumni registration – reconnect with your alma mater and celebrate 34 years of excellence!
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
              textColor="text-red-500"
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
                : undefined
          }
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md overflow-hidden rounded-md border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          {/* step heading */}
          <h2 className="mb-3 text-center text-3xl font-extrabold">
            {step === STEPS.GENERAL && 'Basic Details'}
            {step === STEPS.OTP     && 'Verify OTP'}
            {step === STEPS.DETAILS && 'Alumni Details'}
          </h2>

          <AnimatePresence mode="wait" initial={false}>
            {/* ───────── STEP 0 – GENERAL ──────── */}
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
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                />
                <GlassInput
                  name="alumniCode"
                  placeholder="Alumni Code"
                  value={form.alumniCode}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  Send OTP
                </button>
              </motion.div>
            )}

            {/* ───────── STEP 1 – OTP ──────── */}
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

            {/* ───────── STEP 2 – ALUMNI DETAILS ──────── */}
            {step === STEPS.DETAILS && (
              <motion.div
                key="details"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <GlassInput
                  icon={<IdCard size={18} />}
                  name="rollNumber"
                  placeholder="Roll Number"
                  value={form.rollNumber}
                  onChange={handleChange}
                />
                <GlassInput
                  icon={<Building2 size={18} />}
                  name="company"
                  placeholder="Current Company"
                  value={form.company}
                  onChange={handleChange}
                />
                <GlassInput
                  icon={<Briefcase size={18} />}
                  name="role"
                  placeholder="Role"
                  value={form.role}
                  onChange={handleChange}
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

/* ─── REUSABLE GLASS INPUT ─── */
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
