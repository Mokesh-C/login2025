"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import {
    User,
    ArrowRightLeft,
    Trophy,
    Calendar,
    Presentation,
    CheckCircle,
    MessageCircle,
    LogOut,
    Clock,
    Users,
    Mail,
} from "lucide-react";
import type { Easing } from "framer-motion";
import { useRouter } from "next/navigation";
import ToastCard from "@/components/ToastCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import useRequireAuth from "@/hooks/useRequireAuth";
import useRegister from "@/hooks/useRegister";
import useEvents from "@/hooks/useEvents";
import useTeam from "@/hooks/useTeam";
import { PageLoader } from "@/components/LoadingSpinner";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    time: string;
    status: "success" | "pending" | "failed";
}

interface Event {
    id: string;
    name: string;
    date: string;
    time: string;
    hasCertificate?: boolean;
    isUpcoming?: boolean;
}

interface ErrorMessage {
    id: number;
    message: string;
    type?: 'error' | 'success';
}

const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        "about" | "events" | "teams" | "invitations"
    >("about");
    const [pageLoaded, setPageLoaded] = useState(false);
    const [errorList, setErrorList] = useState<ErrorMessage[]>([]);
    const [errorId, setErrorId] = useState(0);
    const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true); // Start with loading true
    const [userTeams, setUserTeams] = useState<any[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [allInvitations, setAllInvitations] = useState<any[]>([]);
    const [loadingInvitations, setLoadingInvitations] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'accept' | 'decline';
        invitation: any;
        teamName?: string;
        eventName?: string;
    }>({
        isOpen: false,
        type: 'accept',
        invitation: null
    });
    const [isUpdatingInvitation, setIsUpdatingInvitation] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    // Use useRequireAuth for user and loading state
    const { user, isLoading } = useRequireAuth();
    const { getRegistrationsByUser } = useRegister();
    const { events: allEvents } = useEvents();
    const { userTeams: fetchUserTeams, teamMembers, updateInvitation } = useTeam();

    // Static data for transactions and events (replace with API calls if endpoints provided)
    const transactions: Transaction[] = [
        {
            id: "Login_2k25_050911",
            description: "General registration paid successfully",
            amount: 200,
            date: "Thu JUN 30 2025",
            time: "13:43:47",
            status: "success",
        },
    ];

    // Fetch user registrations
    useEffect(() => {
        const fetchUserRegistrations = async () => {
            if (!user || !allEvents.length) return;
            
            setLoadingEvents(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    showError('No access token found');
                    return;
                }

                const result = await getRegistrationsByUser(accessToken);
                
                if (result.success && result.data) {
                    // Extract event IDs only from accepted registrations
                    // For user array: no status check needed (individual registrations are automatically accepted)
                    // For team array: check invitationStatus === "accepted" AND has complete data (teamId, eventId)
                    const userEventIds = result.data.user?.map((reg: any) => reg.eventId) || [];
                    const teamEventIds = result.data.team?.filter((reg: any) => 
                        reg.invitationStatus === "accepted" && reg.teamId && reg.eventId
                    ).map((reg: any) => reg.eventId) || [];
                    const allEventIds = [...userEventIds, ...teamEventIds];

                    // Utility to format date
                    const formatDate = (dateString?: string) => {
                        if (!dateString) return 'TBD';
                        const date = new Date(dateString.replace(' ', 'T'));
                        if (isNaN(date.getTime())) return dateString;
                        return date.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        });
                    };

                    // Match with events data to get event details
                    const userRegisteredEvents = allEventIds.map(eventId => {
                        const event = allEvents.find(e => e.id === eventId);
                        return event ? {
                            id: event.id,
                            name: event.name,
                            date: formatDate(event.rounds?.[0]?.time),
                            hasCertificate: false, // TODO: Add certificate logic when available
                            logoUrl: event.logoUrl,
                            tagline: event.tagline
                        } : null;
                    }).filter(Boolean);

                    setRegisteredEvents(userRegisteredEvents);
                } else {
                    showError(result.message || 'Failed to fetch registrations');
                }
            } catch (error) {
                showError('Failed to fetch user registrations');
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchUserRegistrations();
    }, [user?.id, allEvents.length]); // Only depend on user ID and events length

    // Fetch all invitations (pending, accepted, declined)
    useEffect(() => {
        const fetchAllInvitations = async () => {
            if (!user) return;

            setLoadingInvitations(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    showError('No access token found');
                    return;
                }

                const result = await getRegistrationsByUser(accessToken);
                if (result.success && result.data) {
                    // Get ALL team invitations (pending, accepted, declined)
                    const allTeamInvitations = result.data.team || [];

                    // Get all user teams to find team names
                    const teamsResult = await fetchUserTeams(accessToken);
                    const allTeams = teamsResult.success ? teamsResult.teams : [];

                    // Get event and team details for each invitation
                    const invitationsWithDetails = await Promise.all(
                        allTeamInvitations.map(async (invitation: any) => {
                            const event = allEvents.find(e => e.id === invitation.eventId);
                            let teamAdmin = null;
                            let teamName = `Team ${invitation.teamId}`; // Fallback
                            
                            // Get team members to find admin and team name
                            if (invitation.teamId) {
                                try {
                                    const teamResult = await teamMembers(invitation.teamId, accessToken);
                                    if (teamResult.success && teamResult.members) {
                                        // Find the admin who sent the invite
                                        teamAdmin = teamResult.members.find((member: any) => member.admin === true);
                                        
                                        // Try to get team name from userTeams first
                                        const userTeam = allTeams?.find(t => t.id === invitation.teamId);
                                        if (userTeam?.name) {
                                            teamName = userTeam.name;
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error fetching team details:', error);
                                }
                            }

                            return {
                                ...invitation,
                                event,
                                teamAdmin,
                                teamName
                            };
                        })
                    );

                    setAllInvitations(invitationsWithDetails);
                } else {
                    showError(result.message || 'Failed to fetch invitations');
                }
            } catch (error) {
                showError('Failed to fetch invitations');
            } finally {
                setLoadingInvitations(false);
            }
        };

        if (allEvents.length > 0) {
            fetchAllInvitations();
        }
    }, [user?.id, allEvents.length]);

    // Fetch user teams with members
    useEffect(() => {
        const fetchTeamsWithMembers = async () => {
            if (!user) return;
            
            setLoadingTeams(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    showError('No access token found');
                    return;
                }

                // Step 1: Get user teams
                const teamsResult = await fetchUserTeams(accessToken);
                if (!teamsResult.success || !teamsResult.teams) {
                    showError(teamsResult.message || 'Failed to fetch teams');
                    return;
                }

                // Step 2: For each team, get members and check if current user is accepted
                const teamsWithMembers = await Promise.all(
                    teamsResult.teams.map(async (team) => {
                        try {
                            const membersResult = await teamMembers(team.id, accessToken);
                            const members = membersResult.success ? (membersResult.members || []) : [];
                            
                            // Find current user in the team members
                            const currentUserInTeam = members.find((member: any) => member.userId === user.id);
                            
                            return {
                                ...team,
                                members,
                                userInvitationStatus: currentUserInTeam?.invitationStatus || 'pending'
                            };
                        } catch (error) {
                            return {
                                ...team,
                                members: [],
                                userInvitationStatus: 'pending'
                            };
                        }
                    })
                );

                // Step 3: Filter teams - only show teams where current user has accepted
                const acceptedTeams = teamsWithMembers.filter(team => 
                    team.userInvitationStatus === 'accepted'
                );

                setUserTeams(acceptedTeams);
            } catch (error) {
                showError('Failed to fetch user teams');
            } finally {
                setLoadingTeams(false);
            }
        };

        fetchTeamsWithMembers();
    }, [user?.id]);

    const totalEvents = allEvents.length; // Real total events from backend
    const registeredEventsCount = registeredEvents.length; // User's registered events count


    // Auto-dismiss errors
    useEffect(() => {
        const timers = errorList.map((err) =>
            setTimeout(
                () =>
                    setErrorList((prev) => prev.filter((e) => e.id !== err.id)),
                4000
            )
        );
        return () => timers.forEach(clearTimeout);
    }, [errorList]);

    // Page load animation
    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Error handling
    const showError = (msg: string) => {
        setErrorList((prev) => [...prev, { id: errorId, message: msg, type: 'error' }]);
        setErrorId((prev) => prev + 1);
    };

    // Success handling
    const showSuccess = (msg: string) => {
        setErrorList((prev) => [...prev, { id: errorId, message: msg, type: 'success' }]);
        setErrorId((prev) => prev + 1);
    };

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken') || '';
        await logout(refreshToken);
        window.dispatchEvent(new Event('storageChange'));
        router.push('/');
    };

    // Handle invitation actions
    const handleInvitationAction = (invitation: any, action: 'accept' | 'decline') => {
        const eventName = invitation.event?.name || 'Unknown Event';
        const teamName = invitation.teamName || `Team ${invitation.teamId}`;
        
        setConfirmDialog({
            isOpen: true,
            type: action,
            invitation,
            teamName,
            eventName
        });
    };

    const confirmInvitationAction = async () => {
        if (!confirmDialog.invitation || !user) return;

        setIsUpdatingInvitation(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                showError('No access token found');
                return;
            }

            const { invitation, type } = confirmDialog;
            const result = await updateInvitation(
                invitation.teamId,
                user.id,
                type, // "accept" or "decline"
                accessToken
            );

            if (result.success) {
                // Update local state - update the invitation status in the list
                const newStatus = type === 'accept' ? 'accepted' : 'declined';
                setAllInvitations(prev => 
                    prev.map(inv => 
                        inv.id === invitation.id 
                            ? { ...inv, invitationStatus: newStatus }
                            : inv
                    )
                );
                
                // If accepted, refresh user registrations and teams to update both Events and Teams tabs
                if (type === 'accept') {
                    // Re-fetch user registrations to update the Events tab
                    const regResult = await getRegistrationsByUser(accessToken);
                    if (regResult.success && regResult.data) {
                        const userEventIds = regResult.data.user?.map((reg: any) => reg.eventId) || [];
                        const teamEventIds = regResult.data.team?.filter((reg: any) => 
                            reg.invitationStatus === "accepted" && reg.teamId && reg.eventId
                        ).map((reg: any) => reg.eventId) || [];
                        const allEventIds = [...userEventIds, ...teamEventIds];

                        const formatDate = (dateString?: string) => {
                            if (!dateString) return 'TBD';
                            const date = new Date(dateString.replace(' ', 'T'));
                            if (isNaN(date.getTime())) return dateString;
                            return date.toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            });
                        };

                        const userRegisteredEvents = allEventIds.map(eventId => {
                            const event = allEvents.find(e => e.id === eventId);
                            return event ? {
                                id: event.id,
                                name: event.name,
                                date: formatDate(event.rounds?.[0]?.time),
                                hasCertificate: false,
                                logoUrl: event.logoUrl,
                                tagline: event.tagline
                            } : null;
                        }).filter(Boolean);

                        setRegisteredEvents(userRegisteredEvents);
                    }

                    // Re-fetch teams to update the Teams tab (newly accepted team will now show)
                    const teamsResult = await fetchUserTeams(accessToken);
                    if (teamsResult.success && teamsResult.teams) {
                        const teamsWithMembers = await Promise.all(
                            teamsResult.teams.map(async (team) => {
                                try {
                                    const membersResult = await teamMembers(team.id, accessToken);
                                    const members = membersResult.success ? (membersResult.members || []) : [];
                                    
                                    const currentUserInTeam = members.find((member: any) => member.userId === user.id);
                                    
                                    return {
                                        ...team,
                                        members,
                                        userInvitationStatus: currentUserInTeam?.invitationStatus || 'pending'
                                    };
                                } catch (error) {
                                    return {
                                        ...team,
                                        members: [],
                                        userInvitationStatus: 'pending'
                                    };
                                }
                            })
                        );

                        const acceptedTeams = teamsWithMembers.filter(team => 
                            team.userInvitationStatus === 'accepted'
                        );

                        setUserTeams(acceptedTeams);
                    }
                }

                showSuccess(`Invitation ${type === 'accept' ? 'accepted' : 'declined'} successfully!`);
            } else {
                showError(result.message || `Failed to ${type} invitation`);
            }
        } catch (error) {
            showError(`Failed to ${confirmDialog.type} invitation`);
        } finally {
            setIsUpdatingInvitation(false);
            setConfirmDialog({ isOpen: false, type: 'accept', invitation: null });
        }
    };

    const cancelInvitationAction = () => {
        setConfirmDialog({ isOpen: false, type: 'accept', invitation: null });
    };

    // const renderAboutSection = () => {
    //     if (loading) {
    //         return (
    //             <p className="text-white/60 text-center">
    //                 Loading user data...
    //             </p>
    //         );
    //     }
    //     if (!user) {
    //         return (
    //             <p className="text-white/60 text-center">
    //                 No user data available
    //             </p>
    //         );
    //     }
    //     // Add null checks for preferences and foodPreference
    //     const foodPreference =
    //         user.preferences?.foodPreference || "Not specified";
    //     const accommodation = user.preferences?.accommodation ? "Yes" : "No";

    //     return (
    //         <div className="space-y-6">
    //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                 <div className="space-y-4">
    //                     {[
    //                         { label: "Name", value: user.name },
    //                         { label: "Login Id", value: user.id.toString() },
    //                         { label: "Email", value: user.email },
    //                         { label: "Phone", value: user.mobile },
    //                         { label: "Gender", value: user.gender },
    //                         { label: "Food Preference", value: foodPreference },
    //                         { label: "Accommodation", value: accommodation },
    //                     ].map((field, index) => (
    //                         <div key={index}>
    //                             <label className="block text-sm font-medium text-white/60 mb-1">
    //                                 {field.label}
    //                             </label>
    //                             <p className="font-medium text-white/90">
    //                                 {field.value}
    //                             </p>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    const renderAboutSection = () => {
        if (isLoading) {
            return (
                <p className="text-white/60 text-center">
                    Loading user data...
                </p>
            );
        }

        if (!user) {
            return (
                <p className="text-white/60 text-center">
                    No user data available
                </p>
            );
        }

        const college = user.studentData?.college
            ? user.studentData.college
            : "N/A";

        const fields = [
            { label: "Name", value: user.name },
            { label: "Login Id", value: user.id.toString() },
            { label: "Email", value: user.email },
            { label: "Phone", value: user.mobile },
            { label: "Gender", value: user.gender },
            { label: "College", value: college },
        ];

        return (
            <div className="bg-blue-300/5 p-6 rounded-md space-y-4">
                {fields.map((field, index) => (
                    <div key={index} className="flex items-start gap-6">
                        <p className="w-[15%] text-sm font-medium text-white/60">
                            {field.label}
                        </p>
                        <p className="font-medium text-white/90">
                            {field.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderEventsSection = () => {
        if (registeredEvents.length === 0) {
            return (
                <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md p-8 text-center">
                    <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/90 mb-4">
                        No events registered yet!
                    </p>
                    <p className="text-white/60 text-sm mb-6">
                        Explore exciting events and register to participate in competitions.
                    </p>
                    <button 
                        onClick={() => router.push('/events')}
                        className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover transition-colors"
                    >
                        Explore Events →
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {registeredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="bg-blue-300/5 backdrop-blur-lg border border-blue-300/10 rounded-md p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {event.logoUrl && (
                                    <div className="w-15 h-15 rounded-full bg-blue-300/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1">
                                        <Image
                                            src={event.logoUrl}
                                            alt={event.name || 'Event Logo'}
                                            width={100}
                                            height={100}
                                            className="w-12 h-12 rounded-full object-contain"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-white/90 mb-1">
                                        {event.name}
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        {event.date}
                                    </p>
                                    {/* {event.tagline && (
                                        <p className="text-xs text-white/50 mt-1">
                                            {event.tagline}
                                        </p>
                                    )} */}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Registered</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTeamsSection = () => {
        if (userTeams.length === 0) {
            return (
                <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md p-8 text-center">
                    <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/90 mb-4">
                        You haven't joined any teams yet!
                    </p>
                    <button 
                        onClick={() => router.push('/events')}
                        className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover transition-colors"
                    >
                        Browse Events →
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {userTeams.map((team) => {
                    // Filter out declined members and sort: admins first
                    const sortedMembers = team.members && Array.isArray(team.members)
                        ? [...team.members]
                            .filter(member => member.invitationStatus !== 'declined') // Hide declined members
                            .sort((a, b) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0))
                        : [];
                    return (
                        <div
                            key={team.id}
                            className="bg-blue-300/0 backdrop-blur-lg border border-blue-300/10 rounded-md p-6 shadow-xl"
                        >
                            {/* Team Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-white/90 mb-1">
                                    {team.name}
                                </h3>
                                <span className="text-sm text-white/60">
                                    {sortedMembers.length} Member{sortedMembers.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Team Members */}
                            {sortedMembers.length > 0 && (
                                <div className="mt-4 ">
                                    <h4 className="text-sm font-medium text-white/80 bor">Team Members</h4>
                                    <div className="space-y-2 p-2 bg-blue-300/0 rounded-md">
                                        {sortedMembers.map((member: any) => (
                                            <div key={member.userId} className="flex items-center justify-between p-1 rounded-md">
                                                <div className="flex items-center flex-wrap gap-3">
                                                    <span className="text-sm text-white/90 font-medium">
                                                        {member.name}
                                                    </span>
                                                    {member.admin && (
                                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {member.invitationStatus === 'accepted' ? (
                                                        <div className="flex items-center gap-1 text-green-400">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="text-xs">Accepted</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-yellow-400">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="text-xs">Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderInvitationsSection = () => {
        if (loadingInvitations) {
            return (
                <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md p-8 text-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/90">Loading invitations...</p>
                </div>
            );
        }

        if (allInvitations.length === 0) {
            return (
                <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md p-8 text-center">
                    <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/90 mb-4">
                        No team invitations yet!
                    </p>
                    <p className="text-white/60 text-sm">
                        Team invitations will appear here when you receive them.
                    </p>
                </div>
            );
        }

        // Separate invitations by status - only show invitations with complete data (teamId and eventId)
        const pendingInvitations = allInvitations.filter(inv => 
            inv.invitationStatus === "pending" && inv.teamId && inv.eventId
        );
        const acceptedInvitations = allInvitations.filter(inv => 
            inv.invitationStatus === "accepted" && inv.teamId && inv.eventId
        );
        const declinedInvitations = allInvitations.filter(inv => 
            inv.invitationStatus === "declined" && inv.teamId && inv.eventId
        );

        return (
            <div className="space-y-8">
                {/* Pending Invitations Section */}
                {pendingInvitations.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            Pending Invitations ({pendingInvitations.length})
                        </h3>
                        <div className="space-y-6">
                            {pendingInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-blue-300/5 backdrop-blur-lg border border-blue-300/10 rounded-md p-6 shadow-xl"
                                >
                                    {/* Top section: Logo/Event/Team on left, Buttons on right */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {invitation.event?.logoUrl && (
                                                <div className="w-12 h-12 rounded-full bg-blue-300/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1">
                                                    <Image
                                                        src={invitation.event.logoUrl}
                                                        alt={invitation.event?.name || 'Event Logo'}
                                                        width={100}
                                                        height={100}
                                                        className="w-12 h-12 rounded-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-white/90">
                                                    {invitation.event?.name || 'Unknown Event'}
                                                </h3>
                                                <p className="text-sm text-white/60">
                                                    {invitation.teamName || `Team ${invitation.teamId}`}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleInvitationAction(invitation, 'decline')}
                                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleInvitationAction(invitation, 'accept')}
                                                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/30 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom section: Received invite from info */}
                                    {invitation.teamAdmin && (
                                        <div className="bg-blue-300/10 rounded-md p-3 border-t border-white/10">
                                            <p className="text-white/80 text-sm mb-2">
                                                <span className="font-medium">Received invite from:</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-400" />
                                                <span className="text-white/90 font-medium">
                                                    {invitation.teamAdmin.name}
                                                </span>
                                                <span className="text-white/60 text-sm">
                                                    ({invitation.teamAdmin.email})
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accepted Invitations Section */}
                {acceptedInvitations.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            Accepted Invitations ({acceptedInvitations.length})
                        </h3>
                        <div className="space-y-6">
                            {acceptedInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-green-500/5 backdrop-blur-lg border border-green-500/20 rounded-md p-6 shadow-xl"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {invitation.event?.logoUrl && (
                                            <div className="w-12 h-12 rounded-full bg-green-300/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1">
                                                <Image
                                                    src={invitation.event.logoUrl}
                                                    alt={invitation.event?.name || 'Event Logo'}
                                                    width={100}
                                                    height={100}
                                                    className="w-12 h-12 rounded-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white/90">
                                                {invitation.event?.name || 'Unknown Event'}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {invitation.teamName || `Team ${invitation.teamId}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-medium">Accepted</span>
                                        </div>
                                    </div>

                                    {invitation.teamAdmin && (
                                        <div className="bg-green-500/10 rounded-md p-3">
                                            <p className="text-white/80 text-sm mb-1">
                                                <span className="font-medium text-white/90">Invited by:</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-green-400" />
                                                <span className="text-white/90 font-medium">
                                                    {invitation.teamAdmin.name}
                                                </span>
                                                <span className="text-white/60 text-sm">
                                                    ({invitation.teamAdmin.email})
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Declined Invitations Section */}
                {declinedInvitations.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✕</span>
                            Declined Invitations ({declinedInvitations.length})
                        </h3>
                        <div className="space-y-6">
                            {declinedInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-red-500/5 backdrop-blur-lg border border-red-500/20 rounded-md p-6 shadow-xl opacity-75"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {invitation.event?.logoUrl && (
                                            <div className="w-12 h-12 rounded-full bg-red-300/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1 opacity-60">
                                                <Image
                                                    src={invitation.event.logoUrl}
                                                    alt={invitation.event?.name || 'Event Logo'}
                                                    width={100}
                                                    height={100}
                                                    className="w-12 h-12 rounded-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white/70">
                                                {invitation.event?.name || 'Unknown Event'}
                                            </h3>
                                            <p className="text-sm text-white/50">
                                                {invitation.teamName || `Team ${invitation.teamId}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✕</span>
                                            <span className="font-medium">Declined</span>
                                        </div>
                                    </div>

                                    {invitation.teamAdmin && (
                                        <div className="bg-red-500/10 rounded-md p-3">
                                            <p className="text-white/60 text-sm mb-1">
                                                <span className="font-medium text-white/70">Invited by:</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-red-400" />
                                                <span className="text-white/70 font-medium">
                                                    {invitation.teamAdmin.name}
                                                </span>
                                                <span className="text-white/50 text-sm">
                                                    ({invitation.teamAdmin.email})
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const sectionVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as Easing },
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: { duration: 0.3, ease: [0.42, 0, 1, 1] as Easing },
        },
    };

    if (isLoading || loadingEvents || loadingTeams || loadingInvitations) return <PageLoader text="Loading user data..." />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={pageLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className=" text-white "
        >
            <div className="max-w-7xl mx-auto px-4 pt-12">
                {/* Toast Messages */}
                <AnimatePresence>
                    {errorList.map((e) => (
                        <ToastCard
                            key={e.id}
                            id={e.id}
                            message={e.message}
                            onClose={() =>
                                setErrorList((prev) =>
                                    prev.filter((err) => err.id !== e.id)
                                )
                            }
                            textColor={e.type === 'success' ? "text-green-700" : "text-red-500"}
                        />
                    ))}
                </AnimatePresence>

                {/* Header */}
                <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md shadow-xl p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-blue-300/0 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1.5">
                                {user?.avatarUrl || user?.gender ? (
                                    <Image
                                        src={user?.avatarUrl || (user?.gender?.toLowerCase() === 'male' ? '/boyAvatar.png' : '/girlAvatar.png')}
                                        alt="Profile Avatar"
                                        width={80}
                                        height={80}
                                        className="w-full h-full rounded-full object-cover bg-blue-300/5"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {user?.name || "Loading..."}
                                </h1>
                                <p className="text-white/60">PROFILE</p>
                            </div>
                        </div>
                        {user?.studentData?.idCardUrl && (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">
                                    College ID Uploaded Successfully
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* LEFT PANEL */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-300/10 backdrop-blur-lg border border-blue-300/10 rounded-md p-6 space-y-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <p className="text-white/80 font-semibold">
                                    Total Events: {totalEvents}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <p className="text-white/80 font-semibold">
                                    Registered Events: {registeredEventsCount}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="lg:col-span-3 mb-10 ">
                        <div className="bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl">
                            {/* TAB BAR */}
                            <div className="relative flex gap-2 p-4 border-b border-white/10 bg-blue-300/5 rounded-t-md overflow-x-auto">
                                {(
                                    [
                                        "about",
                                        "events",
                                        "teams",
                                        "invitations",
                                    ] as const
                                ).map((tab) => {
                                    const isActive = activeTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-white/60 hover:bg-white/10"
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="tabIndicator"
                                                    className="absolute inset-0 bg-accent rounded-md z-[-1]"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                            <span
                                                className={
                                                    isActive
                                                        ? "text-white"
                                                        : "text-white/60"
                                                }
                                            >
                                                {tab.charAt(0).toUpperCase() +
                                                    tab.slice(1)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* TAB CONTENT */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        variants={sectionVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        {activeTab === "about" &&
                                            renderAboutSection()}
                                        {activeTab === "events" &&
                                            renderEventsSection()}
                                        {activeTab === "teams" &&
                                            renderTeamsSection()}
                                        {activeTab === "invitations" &&
                                            renderInvitationsSection()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Button */}
            <button
                className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                aria-label="Open chat"
            >
                <MessageCircle className="w-6 h-6" />
            </button>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.type === 'accept' ? 'Accept Invitation' : 'Decline Invitation'}
                message={confirmDialog.type === 'accept' 
                    ? `Are you sure you want to accept the invitation to join "${confirmDialog.teamName}" for "${confirmDialog.eventName}"?`
                    : `Are you sure you want to decline the invitation to join "${confirmDialog.teamName}" for "${confirmDialog.eventName}"?`
                }
                confirmText={confirmDialog.type === 'accept' ? 'Accept' : 'Decline'}
                cancelText="Cancel"
                onConfirm={confirmInvitationAction}
                onCancel={cancelInvitationAction}
                variant={confirmDialog.type}
                isLoading={isUpdatingInvitation}
            />
        </motion.div>
    );
};

export default Profile;
