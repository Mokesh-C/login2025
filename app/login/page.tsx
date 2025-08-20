'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ToastCard from '@/components/ToastCard'
import { X } from 'lucide-react'
import axios from 'axios';
import useUser from '@/hooks/useUser';
import useAuth from '@/hooks/useAuth';
import OtpVerification from '@/components/OtpVerification';
import { OtpPayload, OtpResponse, AccessTokenResponse } from '@/types/auth';
import { getUser } from '@/services/user'

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
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  /* ---------------- Refs & router -------- */
  const otpInputsRef = useRef<HTMLInputElement[]>([])
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Use sendOtp and verifyOtp from useAuth hook
  const { refreshAccessToken, getUser } = useUser();
  const { sendOtp, verifyOtp } = useAuth();

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

  // Automatic access token refresh on login page load
  useEffect(() => {
    const tryRefresh = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        setLoading(true);
        const res = await refreshAccessToken(refreshToken);
        if (res.success && res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
          window.dispatchEvent(new Event('storageChange'));
          const next = searchParams.get('next');
          router.push(next || '/');
          return;
        }
        setLoading(false);
      }
    };
    tryRefresh();
  }, [router, searchParams]);

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
    setLoading(true);
    try {
      const res = await sendOtp(mobile);
      if (!res.success) {
        showError(res.message || 'Failed to send OTP');
        setLoading(false);
        return;
      }
      showSuccess('OTP sent successfully');
      setIsOtpSent(true);
      setTimer(OTP_TIMEOUT);
    } catch {
      showError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const updated = [...otp]
    updated[i] = val
    setOtp(updated)
    if (val && i < OTP_LENGTH - 1) otpInputsRef.current[i + 1]?.focus()
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      showError('Enter the full 4-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await verifyOtp(mobile, code);
      if (!res.success || !res.refreshToken) {
        showError(res.message || 'Invalid OTP or login failed');
        setOtpLoading(false);
        return;
      }
      localStorage.setItem('refreshToken', res.refreshToken);
      // Fetch access token using refresh token
      const accessToken = await refreshAccessToken(res.refreshToken);
      if (!accessToken) {
        showError('Failed to get access token');
        setOtpLoading(false);
        return;
      }
      localStorage.setItem('accessToken', accessToken);
 
      // Get user data to store role
      const userData = await getUser(accessToken);
      localStorage.setItem('userRole', userData.role);
      
      window.dispatchEvent(new Event('storageChange'));
      showSuccess('Login successful');
      const next = searchParams.get('next');
      router.push(next || '/');
    } catch {
      showError('Invalid OTP or login failed');
    } finally {
      setOtpLoading(false);
    }
  };
  

  /* ------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------*/
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] bg-gradient-to-br from-accent-first via-accent-second to-accent-third text-white">
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
          className="w-full max-w-md space-y-6 rounded-md border border-blue-300/10 bg-blue-300/10 p-8 backdrop-blur-xl shadow-2xl"
        >
          {!isOtpSent && (
          <h2 className="text-center text-3xl font-extrabold">Login</h2>
          )}

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
                disabled={loading}
              />
              <button
                onClick={handleSendOtp}
                className="w-full rounded-md bg-accent py-3 font-semibold hover:bg-accent-hover flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <span className="loader mr-2"></span> : null}
                Send OTP
              </button>
            </>
          ) : (
            <OtpVerification
              mobile={mobile}
              otp={otp}
              onOtpChange={handleOtpChange}
              onVerify={handleVerifyOtp}
              onResend={handleSendOtp}
              loading={otpLoading}
              timer={timer}
              description={`Enter the 4-digit OTP sent to ${mobile}`}
              verifyButtonText="Verify OTP & Login"
              resendButtonText="Resend OTP"
            />
          )}

          {/* --------- Account prompt --------- */}
          {!isOtpSent && (
          <p className="pt-2 text-center text-sm text-white/70">
              Don't have an account yet ?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-semibold text-gradient underline"
            >
              Register
            </button>
          </p>
          )}
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
