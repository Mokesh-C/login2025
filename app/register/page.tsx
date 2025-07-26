"use client";

/* ──────────────────────────────────────────────────────────
   PARTICIPANT REGISTER  –  3‑step animated flow
   Steps:
   0. General Info  →  Send OTP
   1. OTP Verification
   2. Detailed Info  →  Submit
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { School, Image as ImageIcon, X, User, Mail, Phone, GraduationCap, BadgeCheck, IdCard } from "lucide-react";
import Image from "next/image";
import ToastCard from "@/components/ToastCard";
import useUser from '@/hooks/useUser';
import useAuth from "@/hooks/useAuth";
import OtpVerification from "@/components/OtpVerification";
import { OtpPayload, OtpResponse, AccessTokenResponse, CreateUserPayload, RegisterStudentPayload } from '@/types/auth';

/* ─── constants ─── */
const OTP_LENGTH = 4;
const OTP_TIMEOUT = 60;
const STEPS = { GENERAL: 0, OTP: 1, DETAILS: 2 } as const;

/* ─── types ─── */
type ErrorMessage = { id: number; message: string };
type College = { Name: string };

export default function ParticipantRegister() {
    /* ---------- full form state ---------- */
    const [form, setForm] = useState({
        /* step‑0 */
        name: "",
        mobile: "",
        /* step‑2 */
        email: "",
        gender: "",
        college: "",
        degree: "",
        specialization: "",
        year: "",
    });

    /* ---------- other state ---------- */
    const [step, setStep] = useState<(typeof STEPS)[keyof typeof STEPS]>(
        STEPS.GENERAL
    );
    const [allColleges, setAll] = useState<College[]>([]);
    const [suggestions, setSuggestions] = useState<College[]>([]);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [timer, setTimer] = useState(OTP_TIMEOUT);
    const [errorList, setErrorList] = useState<ErrorMessage[]>([]);
    const [errorId, setErrorId] = useState(0);
    const [loading, setLoading] = useState(false);

    const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const { createUser, updateUser, registerStudent, refreshAccessToken } = useUser();
    const { sendOtp, verifyOtp } = useAuth();

    /* ── fetch college list once ── */
    useEffect(() => {
        fetch("/colleges.json")
            .then((r) => r.json())
            .then((data) => {
                if (data?.value)
                    setAll(data.value.map((c: string) => ({ Name: c })));
            })
            .catch(console.error);
    }, []);

    /* ── OTP countdown when on OTP step ── */
    useEffect(() => {
        if (step === STEPS.OTP && timer > 0) {
            const t = setTimeout(() => setTimer((p) => p - 1), 1_000);
            return () => clearTimeout(t);
        }
    }, [step, timer]);

    /* ── auto‑dismiss toasts ── */
    useEffect(() => {
        const tids = errorList.map((e) =>
            setTimeout(
                () => setErrorList((prev) => prev.filter((t) => t.id !== e.id)),
                4_000
            )
        );
        return () => tids.forEach(clearTimeout);
    }, [errorList]);

    /* ── helpers ── */
    const showError = (msg: string) => {
        setErrorList([{ id: errorId, message: msg }]);
        setErrorId((prev) => prev + 1);
    };

    const showSuccess = (msg: string) => {
        setErrorList((prev) => [...prev, { id: errorId, message: msg }]);
        setErrorId((prev) => prev + 1);
    };

    /* ── validation per step ── */
    const validateGeneral = () => {
        const { name, mobile } = form;
        if (!name.trim()) { showError("Name is required"); return false; }
        if (!/^\d{10}$/.test(mobile)) { showError("Mobile must be 10 digits"); return false; }
        return true;
    };

    const validateDetails = () => {
        const { email, gender, college, degree, specialization, year } = form;
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) { showError("Invalid email"); return false; }
        if (!gender) { showError("Select gender"); return false; }
        if (!college.trim()) { showError("College name is required"); return false; }
        if (!degree) { showError("Select degree"); return false; }
        if (!specialization.trim()) { showError("Specialization required"); return false; }
        if (!year) { showError("Select year"); return false; }
        return true;
    };

    /* ── input handlers ── */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        /* autocomplete for college */
        if (name === "college") {
            const filtered = allColleges.filter((c) =>
                c.Name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(value ? filtered.slice(0, 10) : []);
        }
    };

    /* ── OTP handling ── */
    const handleOtpChange = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const arr = [...otp];
        arr[idx] = val;
        setOtp(arr);
        if (val && idx < OTP_LENGTH - 1) otpInputsRef.current[idx + 1]?.focus();
    };

    /* ── step 0 submit → create user and send OTP ── */
    const handleGeneralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateGeneral()) return;
        setLoading(true);
        try {
            const userRes = await createUser(form.name, form.mobile);
            if (!userRes.success) {
                showError(userRes.message || "Failed to create user");
                setLoading(false);
                return;
            }
            const otpRes = await sendOtp(form.mobile);
            if (!otpRes.success) {
                showError(otpRes.message || "Failed to send OTP");
                setLoading(false);
                return;
            }
            showSuccess("OTP sent successfully");
            setTimer(OTP_TIMEOUT);
            setStep(STEPS.OTP);
        } catch {
            showError("Failed to create user or send OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ── step 1 verify OTP ── */
    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            showError("Enter full OTP");
            return;
        }
        setLoading(true);
        try {
            const res = await verifyOtp(form.mobile, code);
            if (!res.success || !res.refreshToken) {
                showError(res.message || "OTP verification failed");
                setLoading(false);
                return;
            }
            showSuccess("OTP verified");
            // Get access token
            const accessToken = await refreshAccessToken(res.refreshToken);
            if (!accessToken) {
                showError("Failed to get access token");
                setLoading(false);
                return;
            }
            // Store tokens in localStorage
            localStorage.setItem("refreshToken", res.refreshToken);
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem('userRole', 'student');
            setStep(STEPS.DETAILS);
        } catch {
            showError("OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    /* ── step 2 submit full form ── */
    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateDetails()) return;
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            showError("Access token not found. Please verify OTP again.");
            setLoading(false);
            return;
        }
        try {
            // 1. Update user profile (email, gender)
            const userRes = await updateUser({
                email: form.email,
                gender: form.gender
            }, accessToken);
            if (!userRes.success) {
                showError(userRes.message || "Failed to update user profile");
                setLoading(false);
                return;
            }
            // 2. Register student (academic details)
            const studentRes = await registerStudent({
                college: form.college,
                field: form.specialization,
                programme: form.degree,
                year: Number(form.year), // ensure type is number
            }, accessToken);
            if (!studentRes.success) {
                showError(studentRes.message || "Failed to register student");
                setLoading(false);
                return;
            }
            // Show success and redirect almost simultaneously
            showSuccess("Registration successful!");
            window.dispatchEvent(new Event('storageChange'));
            setTimeout(() => router.push("/"), 500); // reduce delay for smoother UX
        } catch {
            showError("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const removeToast = useCallback(
        (id: number) => setErrorList((prev) => prev.filter((t) => t.id !== id)),
        []
    );

    // Wrapper for OTP resend to match OtpVerification signature
    const handleResendOtp = async () => {
        await handleGeneralSubmit({
            preventDefault: () => {},
        } as React.FormEvent);
    };

    /* ─── UI ─── */
    return (
        <div className="relative flex min-h-screen bg-gradient-to-br from-accent-first via-accent-second to-accent-third text-white">
            {/* LEFT promo panel */}
            <div className="hidden md:flex w-1/2 flex-col items-center justify-center px-10">
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
                    Participant registration – showcase your skills at the 34
                    <sup>th</sup> edition of our national‑level symposium!
                </p>
            </div>

            {/* RIGHT form panel */}
            <div className="relative flex w-full items-center justify-center px-4 py-12 sm:px-6 md:w-1/2">
                {/* Toasts */}
                <AnimatePresence>
                    {errorList.map((e) => (
                        <ToastCard
                            key={e.id}
                            id={e.id}
                            message={e.message}
                            onClose={() => removeToast(e.id)}
                            textColor={
                                e.message.toLowerCase().includes("otp sent") ||
                                e.message.toLowerCase().includes("success") ||
                                e.message.toLowerCase().includes("verified")
                                    ? "text-green-400"
                                    : "text-red-500"
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
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md overflow-hidden rounded-md border border-blue-300/10 bg-blue-300/10 p-8 backdrop-blur-xl shadow-2xl"
                >
                    {/* step headings */}
                    <h2 className="mb-3 text-center text-3xl font-extrabold">
                        {step === STEPS.GENERAL && "Basic Details"}
                        {step === STEPS.DETAILS && "Participant Details"}
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
                                    icon={<User size={18} />}
                                    name="name"
                                    placeholder="Full Name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <GlassInput
                                    icon={<Phone size={18} />}
                                    name="mobile"
                                    type="tel"
                                    maxLength={10}
                                    placeholder="Mobile Number"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loader mr-2"></span>
                                    ) : null}
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
                                <OtpVerification
                                    mobile={form.mobile}
                                    otp={otp}
                                    onOtpChange={handleOtpChange}
                                    onVerify={handleVerifyOtp}
                                    onResend={handleResendOtp}
                                    loading={loading}
                                    timer={timer}
                                    description={`Enter the 4-digit OTP sent to ${form.mobile}`}
                                    verifyButtonText="Verify OTP"
                                    resendButtonText="Resend OTP"
                                />
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
                                <GlassInput
                                    icon={<Mail size={18} />}
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <GlassSelect
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    options={["Male", "Female", "Other"]}
                                    placeholder="Select Gender"
                                    disabled={loading}
                                />
                                {/* College autocomplete */}
                                <div className="relative">
                                    <GlassInput
                                        icon={<School size={18} />}
                                        name="college"
                                        placeholder="College Name"
                                        value={form.college}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="absolute left-0 top-full z-20 max-h-40 w-full overflow-auto rounded bg-white/90 text-black shadow">
                                            {suggestions.map((c, i) => (
                                                <li
                                                    key={i}
                                                    className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                                                    onClick={() => {
                                                        setForm((p) => ({
                                                            ...p,
                                                            college: c.Name,
                                                        }));
                                                        setSuggestions([]);
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
                                    options={[
                                        "M.E.",
                                        "MCA",
                                        "MBA",
                                        "M.Sc.",
                                        "M.Tech.",
                                        "M.Com.",
                                        "M.A.",
                                    ]}
                                    placeholder="Select Degree"
                                    disabled={loading}
                                />

                                <GlassInput
                                    icon={<BadgeCheck size={18} />}
                                    name="specialization"
                                    placeholder="Specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <GlassSelect
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    options={["1", "2", "3", "4", "5"]}
                                    placeholder="Select Year"
                                    disabled={loading}
                                />

                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-accent py-3 font-semibold transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loader mr-2"></span>
                                    ) : null}
                                    Submit Registration
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>
            </div>
        </div>
    );
}

/* ─── REUSABLE GLASS INPUT / SELECT ─── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
};
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
                className={`w-full rounded-md bg-blue-300/10 py-3 ${
                    icon ? "pl-10" : "px-4"
                } pr-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent`}
            />
        </div>
    );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: string[];
    placeholder: string;
};
function GlassSelect({ options, placeholder, ...rest }: SelectProps) {
    return (
        <div className="relative">
            <select
                {...rest}
                className="w-full appearance-none rounded-md bg-blue-300/10 py-3 px-4 text-sm text-white outline-none backdrop-blur-md transition focus:ring-2 focus:ring-accent"
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((o) => (
                    <option key={o} value={o} className="text-black">
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
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </div>
    );
}
