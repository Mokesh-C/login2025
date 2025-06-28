'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    const timers = errorList.map((err) =>
      setTimeout(() => {
        setErrorList((prev) => prev.filter((e) => e.id !== err.id))
      }, 4000)
    )
    return () => timers.forEach(clearTimeout)
  }, [errorList])

  const showError = (msg: string) => {
    setErrorList((prev) => [...prev, { id: errorId, message: msg }])
    setErrorId((prev) => prev + 1)
  }

  const validate = () => {
    let isValid = true

    if (!form.name.trim()) {
      showError('Name is required')
      isValid = false
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email)) {
      showError('Invalid email format. Must be like: name@example.com')
      isValid = false
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      showError('Mobile number must be exactly 10 digits')
      isValid = false
    }

    if (!form.studentType) {
      showError('Please select Participant or Alumni')
      isValid = false
    }

    return isValid
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // Redirect to specific form
      router.push(`/register/${form.studentType}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-8 relative">
      {/* Notifications */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-xs sm:max-w-sm">
        {errorList.map((err) => (
          <div
            key={err.id}
            className="bg-danger text-white px-4 py-3 rounded shadow-lg animate-fade-in-out text-sm"
          >
            {err.message}
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-primary-100 p-6 rounded-lg shadow-md w-full max-w-md space-y-5 text-white"
      >
        <h2 className="text-2xl font-bold text-center">Register - Step 1</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 rounded bg-background text-white"
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 rounded bg-background text-white"
        />

        <input
          name="mobile"
          type="tel"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Mobile Number"
          className="w-full p-3 rounded bg-background text-white"
          maxLength={10}
        />

        <select
          name="studentType"
          value={form.studentType}
          onChange={handleChange}
          className="w-full p-3 rounded bg-background text-white"
        >
          <option value="">Participant or Alumni</option>
          <option value="participant">Participant</option>
          <option value="alumni">Alumni</option>
        </select>

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover py-3 rounded font-semibold"
        >
          Continue
        </button>
      </form>

      {/* Animation for notification card */}
      <style jsx>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-out {
          animation: fade-in-out 4s ease forwards;
        }
      `}</style>
    </div>
  )
}
