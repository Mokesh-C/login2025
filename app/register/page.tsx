'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, GraduationCap, X } from 'lucide-react'
import Image from 'next/image'

type StudentType = 'participant' | 'alumni' | ''
type ErrorMessage = { id: number; message: string }

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    studentType: '' as StudentType,
  })

  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId] = useState(0)
  const router = useRouter()

  const showError = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validate = () => {
    let ok = true
    if (!form.name.trim()) {
      showError('Name is required')
      ok = false
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email)) {
      showError('Invalid email: name@example.com')
      ok = false
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      showError('Mobile number must be 10 digits')
      ok = false
    }
    if (!form.studentType) {
      showError('Select Participant or Alumni')
      ok = false
    }
    return ok
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) router.push(`/register/${form.studentType}`)
  }

  const removeToast = useCallback(
    (id: number) =>
      setErrorList(prev => prev.filter(toast => toast.id !== id)),
    []
  )

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center px-10">
        <Image
            src="/logo.png"
            alt="Login Logo"
            width={480}
            height={240}
            className="w-70-40 mb-6"
        />
        <h1 className="text-4xl font-extrabold mb-4 leading-tight text-center">
          Welcome to LOGIN 2025
        </h1>
        <p className="text-lg text-white/80 max-w-md text-center">
          Experience the 34<sup>th</sup> edition of our prestigious national-level symposium. Join us and explore your potential!
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 sm:px-6 py-12 relative">
        <AnimatePresence>
          {errorList.map(err => (
            <ErrorToast
              key={err.id}
              id={err.id}
              message={err.message}
              onClose={() => removeToast(err.id)}
            />
          ))}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"
        >
          <h2 className="mb-3 text-center text-3xl font-extrabold">
            Register – Step 1
          </h2>

          <GlassInput
            icon={<User size={18} />}
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <GlassInput
            icon={<Mail size={18} />}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <GlassInput
            icon={<Phone size={18} />}
            name="mobile"
            type="tel"
            maxLength={10}
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
          />

          {/* SELECT DROPDOWN */}
          <div className="relative">
            <GraduationCap
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            />
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <select
              name="studentType"
              value={form.studentType}
              onChange={handleChange}
              className="peer w-full appearance-none rounded-md bg-white/10 py-3 pl-10 pr-10 text-sm text-white outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
            >
              <option value="" className="bg-primary text-white">
                Participant or Alumni
              </option>
              <option value="participant" className="bg-primary text-white">
                Participant
              </option>
              <option value="alumni" className="bg-primary text-white">
                Alumni
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Continue
          </button>
        </motion.form>
      </div>
    </div>
  )
}

/* ───── GlassInput ───── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode
}

function GlassInput({ icon, ...props }: InputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
        {icon}
      </span>
      <input
        {...props}
        className="peer w-full rounded-md bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}

/* ───── ErrorToast ───── */
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
      className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg bg-purple-300 px-4 py-3 text-black shadow-xl backdrop-blur-md"
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
