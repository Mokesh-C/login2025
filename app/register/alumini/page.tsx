'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  IdCard,
  Building2,
  Briefcase,
  Image as ImageIcon,
} from 'lucide-react'
import Image from 'next/image'

/* ─── constants ─── */
const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

/* ─── types ─── */
type ErrorMessage = { id: number; message: string }

/* ─── page ─── */
export default function AlumniRegister() {
  /* ---------- state ---------- */
  const [form, setForm] = useState({
    rollNumber: '',
    company: '',
    role: '',
    photo: null as File | null,
  })
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer] = useState(OTP_TIMEOUT)
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId] = useState(0)

  const otpInputsRef = useRef<HTMLInputElement[]>([])

  const router = useRouter()
  const params = useSearchParams()
  const mobile = params.get('mobile') ?? ''
  const name = params.get('name') ?? ''
  const email = params.get('email') ?? ''

  /* ---------- auto‑dismiss toasts ---------- */
  useEffect(() => {
    const tIds = errorList.map(e =>
      setTimeout(
        () => setErrorList(prev => prev.filter(er => er.id !== e.id)),
        4_000
      )
    )
    return () => tIds.forEach(clearTimeout)
  }, [errorList])

  /* ---------- OTP countdown ---------- */
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const t = setTimeout(() => setTimer(p => p - 1), 1_000)
      return () => clearTimeout(t)
    }
  }, [isOtpSent, timer])

  /* ---------- helpers ---------- */
  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validate = () => {
    const { rollNumber, company, role, photo } = form
    let ok = true
    if (!rollNumber.trim()) showError('Roll number is required'), (ok = false)
    if (!company.trim()) showError('Current company is required'), (ok = false)
    if (!role.trim()) showError('Role is required'), (ok = false)
    if (!photo) showError('Photo upload is required'), (ok = false)
    return ok
  }

  /* ---------- handlers ---------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }))

  const sendOtp = async () => {
    await fetch('http://localhost:3000/auth/sendMobileOTP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOtpSent && validate()) {
      try {
        await sendOtp()
        setIsOtpSent(true)
        setTimer(OTP_TIMEOUT)
      } catch {
        showError('Failed to send OTP')
      }
    }
  }

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code }),
      })
      const j = await r.json()
      if (!r.ok || !j.refreshToken) throw new Error()

      /* save alumni data */
      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('mobile', mobile)
      fd.append('studentType', 'alumni')
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v as any))

      await fetch('http://localhost:3000/user/', {
        method: 'POST',
        body: fd,
      })
      router.push('/')
    } catch {
      showError('Invalid OTP or save failed')
    }
  }

  const removeToast = useCallback(
    (id: number) => setErrorList(prev => prev.filter(t => t.id !== id)),
    []
  )

  /* ---------- UI ---------- */
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* LEFT PANEL */}
      <div className="hidden w-1/2 flex-col items-center justify-center px-10 md:flex">
        <Image
          src="/logo.png"
          alt="Login Logo"
          width={480}
          height={240}
          className="mb-6"
        />
        <h1 className="mb-4 text-center text-4xl font-extrabold leading-tight">
          Welcome to LOGIN 2025
        </h1>
        <p className="max-w-md text-center text-lg text-white/80">
          Alumni registration – reconnect with your alma mater and celebrate 34
          years of excellence!
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative flex w-full items-start justify-center px-4 py-12 sm:px-6 md:w-1/2">
        {/* toast */}
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

        {/* glass card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="mb-3 text-center text-3xl font-extrabold">
            Alumni Details
          </h2>

          {/* STEP 1 */}
          {!isOtpSent && (
            <>
              <GlassInput
                icon={<IdCard size={18} />}
                name="rollNumber"
                placeholder="Roll Number"
                value={form.rollNumber}
                onChange={handleInputChange}
              />

              <GlassInput
                icon={<Building2 size={18} />}
                name="company"
                placeholder="Current Company"
                value={form.company}
                onChange={handleInputChange}
              />

              <GlassInput
                icon={<Briefcase size={18} />}
                name="role"
                placeholder="Role"
                value={form.role}
                onChange={handleInputChange}
              />

              {/* file upload */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                  <ImageIcon size={18} />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="block w-full cursor-pointer rounded-md bg-white/10 py-3 pl-10 pr-4 text-sm text-white file:border-0 file:bg-transparent file:text-white/70 backdrop-blur-md"
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

          {/* STEP 2 – OTP */}
          {isOtpSent && (
            <>
              <p className="text-center text-sm">
                Enter the {OTP_LENGTH}-digit OTP sent to{' '}
                <strong>{mobile}</strong>
              </p>

              <div className="flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    ref={el => (otpInputsRef.current[i] = el)}
                    className="h-14 w-14 rounded bg-white text-center text-xl text-black"
                  />
                ))}
              </div>

              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-200">
                  {timer > 0
                    ? `Resend OTP in ${timer}s`
                    : "Didn't get it?"}
                </span>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={async () => {
                    await sendOtp()
                    setTimer(OTP_TIMEOUT)
                  }}
                  className={`${
                    timer > 0
                      ? 'cursor-not-allowed opacity-50'
                      : 'text-blue-400'
                  }`}
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

/* ─── reusable glass input ─── */
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
        className="w-full rounded-md bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}

/* ─── error toast ─── */
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
      animate={{
        x: 0,
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 700, damping: 30 },
      }}
      exit={{
        x: 300,
        y: -100,
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeIn' },
      }}
      className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg  bg-purple-300 px-4 py-3 text-black shadow-xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          aria-label="Close"
          onClick={onClose}
          className="text-black/60 hover:text-black"
        >
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
