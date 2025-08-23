"use client";

import { useState, useEffect, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    type Variants,
    type TargetAndTransition,
} from "framer-motion";
import Image from "next/image";
import {CalendarClock, Users, MapPin, ArrowLeft, Calendar, Clock, DollarSign, Trophy, FileText, Phone, Mail, User, Tag, Star, Award, CheckCircle, ListCheck, Monitor, Timer, Loader2, CircleCheckBig, StarHalf, CircleSmall, Code2} from "lucide-react";

import ToastCard from "@/components/ToastCard";
import type { EventCardProps } from "@/components/EventCard";
import { Event } from "@/types/events";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/LoadingSpinner";
import useRegister from "@/hooks/useRegister";
import useRequireAuth from "@/hooks/useRequireAuth";
import ConfirmationDialog from "@/components/ConfirmationDialog";

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
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogData, setConfirmDialogData] = useState<{
        eventName: string;
        eventId: number;
    } | null>(null);
    
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
    const { user } = useRequireAuth();

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
                    console.log(regRes.data);
                    
                    
                    // Check if user is registered for this event
                    const currentEventId = event.id;
                    
                    if (event.teamMaxSize === 1) {
                        // Individual event - check user registrations only (no status check needed)
                        const userRegistration = regRes.data.user?.find(
                            (reg: any) => reg.eventId === currentEventId
                        );
                        setIsRegistered(!!userRegistration);
                        setInvitationStatus('none'); // Individual events don't have invitations
                    } else if(event.teamMaxSize > 1) {
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
                } else {
                    // Don't show error for permission issues on fresh registrations
                    if (regRes.message && !regRes.message.toLowerCase().includes('permission')) {
                        console.log('Failed to fetch registration status:', regRes.message);
                    }
                }
            } catch (error) {
                console.error("Error checking registration status:", error);
                // Don't show error toast for permission issues on fresh registrations
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
        const nextUrl = `/events/${event.id}`;
        if (!accessToken) {
            // Not authenticated, redirect to login with intent preserved
            router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
            return;
        }

        // Gate: Require profile completeness before allowing registration
        // Criteria: user has email and studentData.college
        if (user && !(user.email && user.studentData && user.studentData.college)) {
            showError("Please complete your profile before registering. Redirecting...");
            setTimeout(() => router.push("/register?step=details"), 500);
            return;
        }
        
        if (event.teamMaxSize === 1) {
            // Show confirmation dialog for individual events
            setConfirmDialogData({
                eventName: event.name,
                eventId: event.id
            });
            setShowConfirmDialog(true);
            return;
        }
        
        if (event.teamMaxSize > 1) {
            // Go to event-specific team creation page with only eventId
            router.push(`/events/create-team?eventId=${event.id}`);
            return;
        }
        notifyError(); // fallback
    };

    // Handle confirmation for individual event registration
    const handleConfirmRegistration = async () => {
        if (!confirmDialogData) return;
        
        setIsRegistering(true);
        try {
            const res = await soloRegister(confirmDialogData.eventId);
            if (res.success) {
                setIsRegistered(true);
                showSuccess(`Registration successful for ${confirmDialogData.eventName}!`);
            } else {
                // Don't show error for permission issues on fresh registrations
                if (res.message && !res.message.toLowerCase().includes('permission')) {
                    showError(res.message || "Failed to register for event.");
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            // Don't show error toast for permission issues on fresh registrations
        } finally {
            setIsRegistering(false);
            setShowConfirmDialog(false);
            setConfirmDialogData(null);
        }
    };

    // Handle cancel confirmation
    const handleCancelRegistration = () => {
        setShowConfirmDialog(false);
        setConfirmDialogData(null);
    };

    // Handle view team navigation
    const handleViewTeam = () => {
        
        router.push(`/events/create-team?eventId=${event.id}`);
    };

    /* ---------------- Render ----------------------- */
    return (
        <motion.section
            initial="hidden"
            animate="show"
            variants={stagger}
            className="min-h-screen bg-gradient-to-br from-accent-first via-accent-second to-accent-third text-white px-4 pb-24 pt-20 overflow-hidden "
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
                                            className="w-28 h-28 md:w-30 md:h-30 rounded-full bg-blue-300/10
                                        backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden"
                                        >
                                            <Image
                                                src={event.logoUrl || ""}
                                                alt={event.name}
                                                width={100}
                                                height={100}
                                                className=" object-cover rounded-full "
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white   leading-tight">
                                            {event.name}
                                            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                                                Challenge Awaits
                                            </span>
                                        </h1>
                                    </div>
                                </div>

                                <p className="sm:text-lg p-4 pb-0 text-gray-300 leading-relaxed max-w-2xl">
                                    {event.tagline}
                                </p>
                            </motion.div>

                            {/* CTA Button */}
                            {!event.closed && false ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Special handling for Star Of Login event */}
                                    {event.name === "Star Of Login" ? (
                                        <motion.div
                                            className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-md px-6 py-4 text-lg font-semibold max-w-md"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.1, delay: 0.5 }}
                                        >
                                            <Trophy className="w-10 h-10 text-amber-400" />
                                            <div className="text-left">
                                                <span className="text-amber-300 text-sm font-normal">
                                                    Winners & runners from all other events will be contacted directly for participation
                                                </span>
                                            </div>
                                        </motion.div>
                                    ) : checkingRegistration ? (
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
                                            {/* For Solo Events: Show "Registered" status */}
                                            {event.teamMaxSize === 1 && (
                                                <motion.div
                                                    className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.1, delay: 0.5 }}
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-green-400 font-semibold">Registered</span>
                                                </motion.div>
                                            )}
                                            
                                            {/* For Team Events: Show "View Team" button */}
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
                                            className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-4 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={!isRegistering ? { scale: 1.05 } : {}}
                                            whileTap={!isRegistering ? { scale: 0.95 } : {}}
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
                            ) : 
                            (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    
                                    {true?(
                                    <motion.div
                                    className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/20 rounded-md px-6 py-4 text-lg font-semibold max-w-md"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.1, delay: 0.5 }}
                                >
                                    
                                    <div className="text-left">
                                        <span className="text-yellow-300 font-medium font-bold block">Registration Starts Soon..</span>
                                        <span className="text-yellow-200/80 text-sm font-normal">
                                            Stay tuned!
                                        </span>
                                    </div>
                                </motion.div>
                                    
                                    
                                    ): checkingRegistration ? (
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
                                             {/* For Solo Events: Show "Registered" status */}
                                             {event.teamMaxSize === 1 && (
                                                 <motion.div
                                                     className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-md px-6 py-4 text-lg font-semibold"
                                                     initial={{ opacity: 0, y: 20 }}
                                                     animate={{ opacity: 1, y: 0 }}
                                                     transition={{ duration: 0.1, delay: 0.5 }}
                                                 >
                                                     <CheckCircle className="w-5 h-5 text-green-400" />
                                                     <span className="text-green-400 font-semibold">Registered</span>
                                                 </motion.div>
                                             )}
                                             
                                             {/* For Team Events: Show "View Team" button */}
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
                                    src={event.images[0]?.url || "https://images.unsplash.com/photo-1739184523594-564cb9b61126?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
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
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <FileText
                                        className={`w-5 h-5 md:w-7 md:h-7 text-cyan-400`}
                                    />
                                </div>
                                About This Event
                            </h2>
                            <p className="text-gray-300 leading-relaxed">
                                {event.description}
                            </p>
                        </motion.div>

                        {/*Rounds*/}
                        <motion.div
                            className="bg-blue-300/5 backdrop-blur-sm rounded-md p-4 sm:p-6 md:p-8 border border-white/10 hover:bg-blue-300/8 transition-all duration-500"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <ListCheck
                                        className={` w-5 h-5 md:w-7 md:h-7  text-cyan-400`}
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
                            className="bg-blue-300/5 backdrop-blur-sm rounded-md p-4 sm:p-6 md:p-8 border border-white/10 hover:bg-blue-300/8 transition-all duration-500"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-md  bg-gradient-to-br from-violet-400/20 to-purple-950/10 border border-violet-400/30`}
                                >
                                    <CheckCircle
                                        className={`w-5 h-5 md:w-7 md:h-7 text-cyan-400`}
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
                                                {/* <div
                                                    className={`w-10 h-10 rounded-md bg-gradient-to-br from-violet-400/30 to-purple-950/10 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-purple-400/30`}
                                                >
                                                    {index + 1}
                                                </div> */}
                                                <span className="text-gray-300 leading-relaxed">
                                                   <Code2 className={`w-4 h-4 md:w-7 md:h-7 text-cyan-400`} /> {rule}
                                                </span>
                                            </motion.div>
                                        ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog for Individual Event Registration */}
            <ConfirmationDialog
                isOpen={showConfirmDialog}
                title="Confirm Event Registration"
                message={`Are you sure you want to register for "${confirmDialogData?.eventName}"?`}
                confirmText="Register"
                cancelText="Cancel"
                onConfirm={handleConfirmRegistration}
                onCancel={handleCancelRegistration}
                variant="accept"
                isLoading={isRegistering}
            />
        </motion.section>
    );
}
