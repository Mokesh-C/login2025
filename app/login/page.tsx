'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ToastCard from '@/components/ToastCard'
import { X } from 'lucide-react'
import axios from 'axios';

/* ------------------------------------------------------------------
 * Constants & types
 * ----------------------------------------------------------------*/

const OTP_LENGTH = 4
const OTP_TIMEOUT = 60

type ErrorMessage = { id: number; message: string }

/* ------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------*/

export default function LoginPage() {
  /* ---------------- State ---------------- */
  const [mobile, setMobile]       = useState('')
  const [otp, setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [timer, setTimer]         = useState(OTP_TIMEOUT)
  const [errorList, setErrorList] = useState<ErrorMessage[]>([])
  const [errorId, setErrorId]     = useState(0)

  /* ---------------- Refs & router -------- */
  const otpInputsRef = useRef<HTMLInputElement[]>([])
  const router       = useRouter()

  /* ---------------- Effects -------------- */
  // OTP countdown
  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const t = setTimeout(() => setTimer((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [isOtpSent, timer])

  // Auto‑dismiss errors
  useEffect(() => {
    const timers = errorList.map((err) =>
      setTimeout(
        () => setErrorList((prev) => prev.filter((e) => e.id !== err.id)),
        4000,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [errorList])

  /* ---------------- Helpers -------------- */
  const showError = (msg: string) => {
    setErrorList((prev) => [...prev, { id: errorId, message: msg }])
    setErrorId((prev) => prev + 1)
  }
  
  const showSuccess = (msg: string) => {
    setErrorList(prev => [...prev, { id: errorId, message: msg }])
    setErrorId(prev => prev + 1)
  }

  const validateMobile = () => {
    if (!/^\d{10}$/.test(mobile)) {
      showError('Enter a valid 10‑digit mobile number')
      return false
    }
    return true
  }

  /* ---------------- Handlers ------------- */
  const handleSendOtp = async () => {
    if (!validateMobile()) return;
  
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/sendMobileOTP`, {
        mobile,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = res.data;
  
      if (res.status !== 200) {
        showError(data?.message || 'Failed to send OTP');
        return;
      }
  
      showSuccess('OTP sent successfully');
      setIsOtpSent(true);
      setTimer(OTP_TIMEOUT);
    } catch (err) {
      const error = axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Failed to send OTP';
      showError(error);
    }
  };
  
  

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const updated = [...otp]
    updated[i] = val
    setOtp(updated)
    if (val && i < OTP_LENGTH - 1) otpInputsRef.current[i + 1]?.focus()
  }

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      showError('Enter the full 4-digit OTP');
      return;
    }
  
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/authMobile`, {
        mobile,
        otp: code,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = res.data;
  
      if (res.status !== 200 || !data.refreshToken) {
        showError(data?.message || 'Invalid OTP or login failed');
        return;
      }
  
      const refreshToken = data.refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
  
      // Fetch access token using refresh token
      const accessRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/accessToken`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });
  
      if (accessRes.status !== 200) {
        showError(accessRes.data?.message || 'Failed to get access token');
        return;
      }
  
      const accessData = accessRes.data;
      const accessToken = accessData.accessToken;
      if (!accessToken) {
        showError('Access token not received from server');
        return;
      }
      localStorage.setItem('accessToken', accessToken);
  
      window.dispatchEvent(new Event('storageChange'));
      showSuccess('Login successful');
      router.push('/');
    } catch (err) {
      const error = axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Invalid OTP or login failed';
      showError(error);
    }
  };
  

  /* ------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------*/
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] bg-gradient-to-br from-primary to-primary-100 text-white">
      {/* ---------- LEFT PANEL (desktop only) ---------- */}
      <div className="hidden w-1/2 flex-col items-center justify-center px-10 md:flex">
        <Image src="/logo.png" alt="Login Logo" width={480} height={240} className="mb-6" />
        <h1 className="mb-4 text-center text-4xl font-extrabold leading-tight">
          Welcome back to LOGIN 2025
        </h1>
        <p className="max-w-md text-center text-lg text-white/80">
          Enter your mobile number to get started. Secure OTP verification keeps your account safe.
        </p>
      </div>

      {/* ---------- RIGHT PANEL (form) ---------- */}
      <div className="relative flex w-full items-center justify-center px-4 py-12 sm:px-6 md:w-1/2">
        {/* Error toasts */}
        <AnimatePresence>
            {errorList.map(e => (
                <ToastCard
                key={e.id}
                id={e.id}
                message={e.message}
                onClose={() => setErrorList(prev => prev.filter(err => err.id !== e.id))}
                textColor={e.message.toLowerCase().includes('success') || e.message.toLowerCase().includes('otp sent')
                    ? 'text-green-400'
                    : 'text-red-500'}
                />
            ))}
        </AnimatePresence>
        
              

        {/* Login box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-6 rounded-md border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-center text-3xl font-extrabold">Login</h2>

          {/* ------------- Step 1: Mobile number ------------- */}
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
                className="w-full rounded-md bg-accent py-3 font-semibold hover:bg-accent-hover"
              >
                Send OTP
              </button>
            </>
          ) : (
            /* ------------- Step 2: OTP -------------------- */
            <>
              <p className="text-center text-sm">
                Enter the 4‑digit OTP sent to <strong>{mobile}</strong>
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
                  className={timer > 0 ? 'cursor-not-allowed opacity-50' : 'text-blue-400'}
                  onClick={handleSendOtp}
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={verifyOtp}
                className="w-full rounded-md bg-green-600 py-3 font-semibold hover:bg-green-700"
              >
                Verify OTP &amp; Login
              </button>
            </>
          )}

          {/* --------- Account prompt --------- */}
          <p className="pt-2 text-center text-sm text-white/70">
           Don't have an account yet ? {' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-semibold text-gradient underline"
            >
              Register
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * GlassInput (shared)                                                */

type InputProps = React.InputHTMLAttributes<HTMLInputElement>
function GlassInput(props: InputProps) {
  return (
    <input
      {...props}
      className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
    />
  )
}
