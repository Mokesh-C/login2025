'use client'

import React, { useRef } from 'react';

interface OtpVerificationProps {
  mobile: string;
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  loading: boolean;
  timer: number;
  otpLength?: number;
  title?: string;
  description?: string;
  verifyButtonText?: string;
  resendButtonText?: string;
  children?: React.ReactNode;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  mobile,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  loading,
  timer,
  otpLength = 4,
  title = 'Verify OTP',
  description = '',
  verifyButtonText = 'Verify OTP',
  resendButtonText = 'Resend OTP',
  children,
}) => {
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div>
      {title && <h2 className="text-center text-3xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-center text-sm mb-4">{description}</p>}
      {children}
      <div className="flex justify-between gap-2 mb-4">
        {Array.from({ length: otpLength }).map((_, i) => (
          <input
            key={i}
            maxLength={1}
            value={otp[i] || ''}
            onChange={e => {
              const val = e.target.value;
              onOtpChange(i, val);
              if (val && i < otpLength - 1) {
                otpInputsRef.current[i + 1]?.focus();
              }
            }}
            onKeyDown={e => {
              if (
                (e.key === 'Backspace' || e.key === 'Delete') &&
                !otp[i] &&
                i > 0
              ) {
                otpInputsRef.current[i - 1]?.focus();
              }
            }}
            ref={el => {
              otpInputsRef.current[i] = el;
            }}
            className="h-14 w-14 rounded bg-white text-center text-xl text-black border-2 border-transparent focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition"
            disabled={loading}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between text-sm mb-4">
        <span className="text-gray-200">
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Didn’t get it?'}
        </span>
        <button
          type="button"
          disabled={timer > 0 || loading}
          className={timer > 0 || loading ? 'cursor-not-allowed opacity-50' : 'text-violet-400 hover:text-violet-300'}
          onClick={onResend}
        >
          {resendButtonText}
        </button>
      </div>
      <button
        onClick={onVerify}
        className="w-full rounded-md bg-green-600 py-3 font-semibold hover:bg-green-700 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <span className="loader mr-2"></span> : null}
        {verifyButtonText}
      </button>
    </div>
  );
};

export default OtpVerification;