"use client";

import { useState, useEffect, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    type Variants,
    type TargetAndTransition,
} from "framer-motion";
import Image from "next/image";
import {
    CalendarClock,
    Users,
    MapPin,
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    Trophy,
    FileText,
    Phone,
    Mail,
    User,
    Tag,
    Star,
    Award,
    CheckCircle,
    ListCheck,
    Monitor,
    Timer,
    Loader2,
} from "lucide-react";

import ToastCard from "@/components/ToastCard";
import type { EventCardProps } from "@/components/EventCard";
import { Event } from "@/types/events";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/LoadingSpinner";
import useRegister from "@/hooks/useRegister";

/* ---------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------*/

type EventDetails = EventCardProps & {
    description: string;
    rounds: { name: string; details: string[] }[];
    rules: string[];
    contact: { name: string; phone: string }[];
    teamSize: string;
    date: string;
    time?: string;
    location?: string;
};

/* ---------------------------------------------------------------------
 * Animation presets
 * -------------------------------------------------------------------*/

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

const stagger: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.2,
        },
    },
};

const borderAnim: TargetAndTransition = {
    borderColor: ["#bcabed", "#A78BFA", "#7759cf", "#442278", "#bcabed"],
    transition: { duration: 4, repeat: Infinity, ease: "linear" },
};

/* ---------------------------------------------------------------------
 * Small helpers
 * -------------------------------------------------------------------*/

function MetaCard({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            variants={fadeUp}
            className="rounded-md p-6 bg-blue-300/10 backdrop-blur-[4px]
                 border border-white/15 shadow-md flex flex-col items-center text-center gap-2"
        >
            <div className="flex items-center gap-2 text-lg">
                {icon}
                <span className="font-semibold">{label}</span>
            </div>
            {children}
        </motion.div>
    );
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={fadeUp}
            className="rounded-md p-8 bg-blue-300/10 backdrop-blur-[4px]
                 border border-white/15 shadow-md"
        >
            {children}
        </motion.div>
    );
}

// Utility to format date/time
function formatDateTime(dateString?: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.replace(' ', 'T'));
  if (isNaN(date.getTime())) return dateString;
  let formatted = date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  // Ensure comma and uppercase AM/PM
  formatted = formatted.replace(',', ',').replace(/([ap]m)$/i, (m) => m.toUpperCase());
  return formatted;
}

/* ---------------------------------------------------------------------
 * Main component
 * -------------------------------------------------------------------*/

export default function EventDetailsContent({ event }: { event: Event }) {
    /* ---------------- Toast handling ---------------- */
    const [errorList, setErrorList] = useState<{ id: number; message: string }[]>([]);
    const [errorId, setErrorId] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(false);
    const [registrationData, setRegistrationData] = useState<any>(null);
    const [invitationStatus, setInvitationStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
    const [teamName, setTeamName] = useState<string>('');
    
    const notifyError = () =>
        setErrorList((prev) => [
            ...prev,
            {
                id: errorId,
                message: "The site is under development — registration is unavailable.",
            },
        ]);

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

    const removeToast = useCallback(
        (id: number) => setErrorList((prev) => prev.filter((t) => t.id !== id)),
        []
    );


    const router = useRouter();
    const { soloRegister, getRegistrationsByUser } = useRegister();

    // Check registration status on component mount
    useEffect(() => {
        const checkRegistrationStatus = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) return;

            setCheckingRegistration(true);
            try {
                const regRes = await getRegistrationsByUser();
                if (regRes.success && regRes.data) {
                    setRegistrationData(regRes.data);
                    
                    // Check if user is registered for this event
                    const currentEventId = event.id;
                    
                    if (event.teamMaxSize === 1) {
                        // Individual event - check user registrations only (no status check needed)
                        const userRegistration = regRes.data.user?.find(
                            (reg: any) => reg.eventId === currentEventId
                        );
                        setIsRegistered(!!userRegistration);
                        setInvitationStatus('none'); // Individual events don't have invitations
                    } else {
                        // Team event - check team registrations and invitation status
                        const teamRegistration = regRes.data.team?.find(
                            (reg: any) => reg.eventId === currentEventId && reg.teamId
                        );
                        
                        if (teamRegistration) {
                            setInvitationStatus(teamRegistration.invitationStatus || 'none');
                            setTeamName(teamRegistration.teamName || 'Team');
                            
                            // Only set as registered if invitation is accepted
                            if (teamRegistration.invitationStatus === 'accepted') {
                                setIsRegistered(true);
                            } else {
                                setIsRegistered(false);
                            }
                        } else {
                            setIsRegistered(false);
                            setInvitationStatus('none');
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking registration status:", error);
            } finally {
                setCheckingRegistration(false);
            }
        };

        checkRegistrationStatus();
    }, [event.id, event.teamMaxSize]);

    // Registration handler
    const handleRegister = async () => {
        // Check for authentication (accessToken in localStorage)
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            // Not authenticated, redirect to login
            router.push("/login");
            return;
        }
        
        if (event.teamMaxSize === 1) {
            // Solo registration            
            setIsRegistering(true);
            try {
                const res = await soloRegister(event.id);
                if (res.success) {
                    setIsRegistered(true);
                    showSuccess(`Registration successful for ${event.name}!`);
                } else {
                    showError(res.message || "Failed to register for event.");
                }
            } catch (error) {
                showError("Failed to register for event.");
            } finally {
                setIsRegistering(false);
            }
            return;
        }
        
        if (event.teamMaxSize > 1) {
            // Go to event-specific team creation page with eventId, eventName, eventLogo, teamSize, and eventMinSize as query params
            router.push(`/events/create-team?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}&eventLogo=${encodeURIComponent(event.logoUrl || "")}&teamSize=${event.teamMaxSize}&eventMinSize=${event.teamMinSize}`);
            return;
        }
        notifyError(); // fallback
    };

    // Handle view team navigation
    const handleViewTeam = () => {
        router.push(`/events/create-team?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}&eventLogo=${encodeURIComponent(event.logoUrl || "")}&teamSize=${event.teamMaxSize}&eventMinSize=${event.teamMinSize}`);
    };

    /* ---------------- Render ----------------------- */
    return (
        <motion.section
            initial="hidden"
            animate="show"
            variants={stagger}
            className="min-h-screen bg-gradient-to-br from-accent-first via-accent-second to-accent-third text-white px-4 pb-24 pt-20 overflow-hidden"
        >
            {/* Toasts */}
            <AnimatePresence>
                {errorList.map((e) => (
                    <ToastCard
                        key={e.id}
                        id={e.id}
                        message={e.message}
                        onClose={() => removeToast(e.id)}
                        textColor={
                            e.message.toLowerCase().includes("successful") ||
                            e.message.toLowerCase().includes("success")
                                ? "text-green-400"
                                : "text-red-500"
                        }
                    />
                ))}
            </AnimatePresence>

            {/* -------------------- HERO ROW -------------------- */}
            <motion.div
                className="relative z-10 px-auto md:px-6 pb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="flex gap-5 ">
                                    <div className="md:w-1/4 flex justify-center items-center">
                                        <div
                                            className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-300/10
                                        backdrop-blur-sm border border-white/20 flex items-center justify-center"
                                        >
                                            <Image
                                                src={event.logoUrl || ""}
                                                alt={event.name}
                                                width={112}
                                                height={112}
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                            {event.name}
                                            <span className="block text-3xl lg:text-4xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                                                Challenge Awaits
                                            </span>
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                                    {
                                        "Showcase your programming skills in this intense coding competition."
                                    }
                                </p>
                            </motion.div>

                            {/* CTA Button */}
                            {!event.closed ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {checkingRegistration ? (
                                        <motion.button
                                            className="bg-gray-600 text-white font-bold py-4 px-8 rounded-md text-lg opacity-50 cursor-not-allowed"
                                            disabled
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1, delay: 0.5 }}
                                        >
                                            <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                                            Checking...
                                        </motion.button>
                                    ) : invitationStatus === 'pending' ? (
                                        <>
                                            <motion.div
                                                className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <Mail className="w-5 h-5 text-yellow-400" />
                                                <span className="text-yellow-400 font-semibold">Pending Invitation</span>
                                            </motion.div>
                                            <motion.button
                                                className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => router.push('/profile?tab=invitations')}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <User className="w-5 h-5 inline-block mr-2" />
                                                View Invitations
                                            </motion.button>
                                        </>
                                    ) : isRegistered ? (
                                        <>
                                            <motion.div
                                                className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                <span className="text-green-400 font-semibold">Registered</span>
                                            </motion.div>
                                            {event.teamMaxSize > 1 && (
                                                <motion.button
                                                    className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleViewTeam}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.1, delay: 0.5 }}
                                                >
                                                    <Users className="w-5 h-5 inline-block mr-2" />
                                                    View Team
                                                </motion.button>
                                            )}
                                        </>
                                    ) : (
                                        <motion.button
                                            className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleRegister}
                                            disabled={isRegistering}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1, delay: 0.5 }}
                                        >
                                            {isRegistering ? (
                                                <>
                                                    <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                                                    Registering...
                                                </>
                                            ) : (
                                                "Register Now"
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {checkingRegistration ? (
                                        <motion.button
                                            className="bg-gray-600 text-white font-bold py-4 px-8 rounded-md text-lg opacity-50 cursor-not-allowed"
                                            disabled
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1, delay: 0.5 }}
                                        >
                                            <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                                            Checking...
                                        </motion.button>
                                    ) : invitationStatus === 'pending' ? (
                                        <>
                                            <motion.div
                                                className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <Mail className="w-5 h-5 text-yellow-400" />
                                                <span className="text-yellow-400 font-semibold">Pending Invitation</span>
                                            </motion.div>
                                            <motion.button
                                                className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => router.push('/profile?tab=invitations')}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <User className="w-5 h-5 inline-block mr-2" />
                                                View Invitations
                                            </motion.button>
                                        </>
                                    ) : isRegistered ? (
                                        <>
                                            <motion.div
                                                className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.1, delay: 0.5 }}
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                <span className="text-green-400 font-semibold">Registered</span>
                                            </motion.div>
                                            {event.teamMaxSize > 1 && (
                                                <motion.button
                                                    className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleViewTeam}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.1, delay: 0.5 }}
                                                >
                                                    <Users className="w-5 h-5 inline-block mr-2" />
                                                    View Team
                                                </motion.button>
                                            )}
                                        </>
                                    ) : (
                                        <motion.div
                                            className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1, delay: 0.5 }}
                                        >
                                            <CheckCircle className="w-5 h-5 text-red-400" />
                                            <span className="text-red-400 font-semibold">Registration Closed</span>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Image */}
                        <motion.div
                            className="relative hidden lg:block"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <div className="relative rounded-md overflow-hidden border border-white/20 shadow-2xl">
                                <Image
                                    src={event.images[0]?.url}
                                    alt={event.name}
                                    width={800}
                                    height={384}
                                    className="w-full h-96 object-cover"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                className="absolute -top-6 -right-6 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-md p-4 shadow-2xl"
                                animate={{ y: [0, -10, 0] }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Trophy className="w-8 h-8 text-white" />
                            </motion.div>

                            <motion.div
                                className="absolute -bottom-6 -left-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md p-4 shadow-2xl"
                                animate={{ y: [0, 10, 0] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Star className="w-8 h-8 text-white" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto md:px-6 md:py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {/* Event Details Card */}
                        <div className="bg-blue-300/5 backdrop-blur-sm rounded-md p-6 border border-white/10 sticky top-6 hover:bg-blue-300/8 transition-all duration-500">
                            <h3 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                                Event Details
                            </h3>

                            <div className="space-y-5">
                                {/* Date (from first round, formatted) */}
                                <motion.div
                                    className="flex items-center gap-4 p-4 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                                        <Calendar className={`w-5 h-5 text-cyan-400`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Date</p>
                                        <p className="font-semibold text-white">{formatDateTime(event.rounds[0]?.time).split(',')[0]}</p>
                                    </div>
                                </motion.div>
                                {/* Event Type */}
                                <motion.div
                                    className="flex items-center gap-4 p-4 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                                        <Tag className={`w-5 h-5 text-cyan-400`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Event Type</p>
                                        <p className="font-semibold text-white">{event.type || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                {/* Venue (from first round) */}
                                <motion.div
                                    className="flex items-center gap-4 p-4 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                                        <MapPin className={`w-5 h-5 text-cyan-400`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Venue</p>
                                        <p className="font-semibold text-white">{event.rounds[0]?.venue || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                {/* Team Size */}
                                <motion.div
                                    className="flex items-center gap-4 p-4 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}>
                                        <Users className={`w-5 h-5 text-cyan-400`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Team Size</p>
                                        <p className="font-semibold text-white">
                                            {event.teamMinSize === event.teamMaxSize
                                                ? event.teamMinSize
                                                : `${event.teamMinSize} - ${event.teamMaxSize}`}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Coordinators */}
                        <div className="bg-blue-300/5 backdrop-blur-sm rounded-md p-6 border border-white/10 hover:bg-blue-300/8 transition-all duration-500">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Event Coordinators
                            </h3>
                            <div className="space-y-4">
                                {event.coordinators == null ||
                                    (event.coordinators.length === 0 && (
                                        <p className="leading-relaxed text-lg">
                                            No coordinators found
                                        </p>
                                    ))}
                                {event.coordinators?.map(
                                    (coordinator, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                        >
                                            <p className="font-semibold text-white mb-2">
                                                {coordinator.name}
                                            </p>
                                            <div className="space-y-2">
                                                <a
                                                    href={`tel:${coordinator.mobile}`}
                                                    className={`flex items-center gap-2 text-sm text-whilte/80 hover:text-white/90 transition-colors`}
                                                >
                                                    <Phone className="w-4 h-4 text-cyan-300" />
                                                    {coordinator.mobile}
                                                </a>
                                                {coordinator.email && (
                                                    <a
                                                        href={`mailto:${coordinator.email}`}
                                                        className="flex items-center gap-2 text-sm text-white/80 hover:text-white/90 transition-colors"
                                                    >
                                                        <Mail className="w-4 h-4 text-cyan-300" />
                                                        {coordinator.email}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <motion.div
                            className="bg-blue-300/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-blue-300/8 transition-all duration-500"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <FileText
                                        className={`w-7 h-7 text-cyan-400`}
                                    />
                                </div>
                                About This Event
                            </h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {event.description}
                            </p>
                        </motion.div>

                        {/*Rounds*/}
                        <motion.div
                            className="bg-blue-300/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-blue-300/8 transition-all duration-500"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <ListCheck
                                        className={`w-7 h-7 text-cyan-400`}
                                    />
                                </div>
                                Rounds
                            </h2>
                            <div className="lg:col-span-8 space-y-10">
                                {event.rounds.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        className="p-5 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <h4 className="font-bold mb-1">
                                            {i + 1}. {r.name}
                                        </h4>
                                        <ul className="list-disc ml-6 space-y-1 text-white/80">
                                            {r.description
                                                ?.split("\n")
                                                .map((d, j) => (
                                                    <li key={j}>{d}</li>
                                                ))}
                                        </ul>

                                        {/* Round Details Row */}
                                        <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
                                            {/* Mode */}
                                            <div className="flex items-center gap-2 bg-blue-300/10 border border-white/10 rounded-md px-3 py-2 min-w-[110px]">
                                                <Monitor className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm text-white/90 font-medium">{r.mode || 'N/A'}</span>
                                            </div>
                                            {/* Venue */}
                                            <div className="flex items-center gap-2 bg-blue-300/10 border border-white/10 rounded-md px-3 py-2 min-w-[110px]">
                                                <MapPin className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm text-white/90 font-medium">{r.venue || 'N/A'}</span>
                                            </div>
                                            {/* Time */}
                                            <div className="flex items-center gap-2 bg-blue-300/10 border border-white/10 rounded-md px-3 py-2 min-w-[110px]">
                                                <Clock className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm text-white/90 font-medium">{formatDateTime(r.time)}</span>
                                            </div>
                                            {/* Duration */}
                                            <div className="flex items-center gap-2 bg-blue-300/10 border border-white/10 rounded-md px-3 py-2 min-w-[110px]">
                                                <Timer className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm text-white/90 font-medium">{r.duration ? `${r.duration} min` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Rules Section */}
                        <motion.div
                            className="bg-blue-300/5 backdrop-blur-sm rounded-md p-8 border border-white/10 hover:bg-blue-300/8 transition-all duration-500"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <CheckCircle
                                        className={`w-7 h-7 text-cyan-400`}
                                    />
                                </div>
                                Rules & Guidelines
                            </h2>
                            <div className="space-y-4">
                                {event.rules &&
                                    event.rules
                                        .split("[break]")
                                        .filter((i) => i.trim() != "")
                                        .map((rule, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-start gap-4 p-5 rounded-md bg-blue-300/5 border border-white/10 hover:bg-blue-300/8 transition-all duration-300"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.1 * index,
                                                }}
                                                whileHover={{ x: 5 }}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-md bg-gradient-to-br from-violet-400/30 to-purple-950/10 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-purple-400/30`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <span className="text-gray-300 leading-relaxed text-lg">
                                                    {rule}
                                                </span>
                                            </motion.div>
                                        ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
