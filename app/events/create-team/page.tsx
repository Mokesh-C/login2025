"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useRequireAuth from "@/hooks/useRequireAuth";
import { PageLoader } from "@/components/LoadingSpinner";
import ToastCard from "@/components/ToastCard";
import Image from "next/image";
import { Users, Loader2, UserPlus, Mail, ChevronUp, ChevronDown, CheckCircle, User } from "lucide-react";
import { FaUsersGear, FaUserPlus } from "react-icons/fa6";
import useTeam from "@/hooks/useTeam";
import useRegister from "@/hooks/useRegister";

function CreateTeamPageContent() {
  const { user, isLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get("eventId") || "";
  const eventName = searchParams.get("eventName") || "";
  const teamMaxSize = searchParams.get("teamSize") || "";
  const eventLogo = searchParams.get("eventLogo") || "";
  const eventMinSize = searchParams.get("eventMinSize") || "";

  // New state for the redesigned flow
  const [teamName, setTeamName] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [errorList, setErrorList] = useState<{ id: number; message: string }[]>([]);
  const [errorId, setErrorId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teamMembersList, setTeamMembersList] = useState<any[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [currentTeamSize, setCurrentTeamSize] = useState(0);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'checking' | 'new' | 'existing' | 'error'>('checking');
  
  // First Path - Hybrid approach state
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showExistingMembers, setShowExistingMembers] = useState(false);
  const [loadingExistingMembers, setLoadingExistingMembers] = useState(false);
  
  const { createTeam, teamMembers, inviteTeam, userTeams } = useTeam();
  const { teamRegister, getRegistrationsByUser } = useRegister();

  // Calculate team size constraints
  const minTeamSize = Number(eventMinSize) || 1;
  const maxTeamSize = Number(teamMaxSize) || 1;
  const maxEmailInputs = maxTeamSize - 1; // Excluding current user
  const minEmailsRequired = minTeamSize - 1; // Excluding current user

  // Initialize email inputs based on team size and selected members
  useEffect(() => {
    if (maxEmailInputs > 0) {
      // Calculate available input slots (max - selected members)
      const availableSlots = Math.max(0, maxEmailInputs - selectedMembers.length);
      const newEmails = new Array(availableSlots).fill("");
      
      // Preserve existing email values where possible
      for (let i = 0; i < Math.min(memberEmails.length, availableSlots); i++) {
        if (memberEmails[i]) {
          newEmails[i] = memberEmails[i];
        }
      }
      
      setMemberEmails(newEmails);
    }
  }, [maxEmailInputs, selectedMembers.length]);

  // Toast helpers
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

  // Auto-dismiss toasts
  useEffect(() => {
    const tids = errorList.map((e) =>
      setTimeout(() => setErrorList((prev) => prev.filter((t) => t.id !== e.id)), 4000)
    );
    return () => tids.forEach(clearTimeout);
  }, [errorList]);

  // Fetch user's existing team members (for hybrid approach)
  const fetchExistingMembers = async () => {
    if (!user) return;
    
    setLoadingExistingMembers(true);

    try {
      // Get user's teams
      const teamsRes = await userTeams();
      
      if (!teamsRes.success || !teamsRes.teams) {
        // Don't show error for permission issues on fresh registrations
        if (teamsRes.message && !teamsRes.message.toLowerCase().includes('permission')) {
          console.log('Failed to fetch teams:', teamsRes.message);
        }
        setLoadingExistingMembers(false);
        return;
      }

      // Get all members from all user's teams
      const allMembers: any[] = [];
      const memberEmails = new Set<string>(); // To avoid duplicates

      for (const team of teamsRes.teams) {
        try {
          const membersRes = await teamMembers(team.id);
          
          if (membersRes.success && membersRes.members) {
            membersRes.members.forEach((member: any) => {
              // Skip current user and avoid duplicates
              // Use more flexible email comparison
              const currentUserEmail = user.email?.toLowerCase();
              const memberEmail = member.email?.toLowerCase();
              
              if (memberEmail && memberEmail !== currentUserEmail && !memberEmails.has(memberEmail)) {
                memberEmails.add(memberEmail);
                allMembers.push({
                  ...member,
                  teamName: team.name // Add team name for context
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching members for team ${team.id}:`, error);
        }
      }
      
      setExistingMembers(allMembers);
    } catch (error) {
      console.error("Error fetching existing members:", error);
    } finally {
      setLoadingExistingMembers(false);
    }
  };

  // Check for existing registration on page load - OPTIMIZED
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!user) return;
      
      setCheckingRegistration(true);
      setRegistrationStatus('checking');
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setCheckingRegistration(false);
        setRegistrationStatus('new');
        return;
      }

      try {
        // ONLY check registration status - minimal API call
        const regRes = await getRegistrationsByUser();
        if (!regRes.success || !regRes.data) {
          // Don't show error for permission issues on fresh registrations
          if (regRes.message && !regRes.message.toLowerCase().includes('permission')) {
            console.log('Failed to fetch registration status:', regRes.message);
          }
          setCheckingRegistration(false);
          setRegistrationStatus('new');
          return;
        }

        const { team } = regRes.data;
        if (!team || !Array.isArray(team)) {
          setCheckingRegistration(false);
          setRegistrationStatus('new');
          return;
        }

        // Find team registration for current event
        const currentEventId = Number(eventId);
        const existingRegistration = team.find(
          (reg: any) => reg.eventId === currentEventId && reg.teamId
        );

        if (existingRegistration && existingRegistration.teamId) {
          // User IS registered - now fetch team details
          setTeamId(existingRegistration.teamId);
          setIsRegistered(true);
          setRegistrationStatus('existing');
          
          // Fetch team details in parallel
          try {
            const [teamsRes, membersRes] = await Promise.all([
              userTeams(),
              fetchTeamMembers(existingRegistration.teamId)
            ]);
            
            // Set team name
            if (teamsRes.success && teamsRes.teams) {
              const currentTeam = teamsRes.teams.find(team => team.id === existingRegistration.teamId);
              console.log("Found current team:", currentTeam);
              if (currentTeam) {
                setTeamName(currentTeam.name);
              } else {
                setTeamName("My Team");
              }
            } else {
              setTeamName("My Team");
            }
          } catch (error) {
            setTeamName("My Team");
          }
          
        } else {
          // User NOT registered - show form immediately
          setRegistrationStatus('new');
        }
          
      } catch (error) {
        console.error("Error checking registration:", error);
        setRegistrationStatus('error');
        // Don't show error toast for permission issues on fresh registrations
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [user, eventId]);

  // Handle email input changes
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...memberEmails];
    newEmails[index] = value;
    setMemberEmails(newEmails);
  };

  // Handle existing member selection
  const handleMemberSelection = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, email]);
    } else {
      setSelectedMembers(prev => prev.filter(e => e !== email));
    }
  };

  // Get all team members (emails + selected)
  const getAllTeamEmails = () => {
    const validEmails = memberEmails.filter(email => email.trim() !== "");
    const allEmails = [...validEmails, ...selectedMembers];
    
    // Remove duplicates
    const uniqueEmails = Array.from(new Set(allEmails.map(email => email.toLowerCase())));
    return uniqueEmails;
  };

  // Check if minimum team size is achieved (including current user + selected members)
  const isMinimumSizeAchieved = () => {
    const allEmails = getAllTeamEmails();
    const totalTeamSize = allEmails.length + 1; // +1 for current user
    return totalTeamSize >= minTeamSize;
  };

  // Get total team size including current user
  const getTotalTeamSize = () => {
    const allEmails = getAllTeamEmails();
    return allEmails.length + 1; // +1 for current user
  };

  // Check if team size exceeds maximum
  const exceedsMaxSize = () => {
    return getTotalTeamSize() > maxTeamSize;
  };

  // Fetch team members (for post-registration state) - OPTIMIZED
  const fetchTeamMembers = async (teamId: number) => {
    try {
      const membersRes = await teamMembers(teamId);
      if (membersRes.success && membersRes.members) {
        setTeamMembersList(membersRes.members);
        // Only count accepted and pending members (exclude declined)
        const activeMembers = membersRes.members.filter(member => 
          member.invitationStatus !== 'declined'
        );
        setCurrentTeamSize(activeMembers.length);
      }
      return membersRes; // Return for Promise.all usage
    } catch (error) {
      console.error("Error fetching team members:", error);
      return { success: false };
    }
  };

  // Main registration handler - Does all three steps in one click
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      showError("Please enter a team name.");
      return;
    }

    if (!isMinimumSizeAchieved()) {
      showError(`Please enter at least ${minEmailsRequired} team member email${minEmailsRequired > 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);
    const allEmails = getAllTeamEmails();
    let createdTeamId: number | null = null;
    let inviteResults: { email: string; success: boolean; message?: string }[] = [];

    try {
      // Step 1: Create Team
      const teamRes = await createTeam(teamName);
        
      if (!teamRes.success || !teamRes.teamId) {
          // Don't clear emails if team name already exists  
        showError(teamRes.message || "Failed to create team.");
        setLoading(false);
        return;
      }
      
      createdTeamId = teamRes.teamId;
      setTeamId(createdTeamId);

      // Step 2: Send Invites to all emails (from inputs + selected)
      for (const email of allEmails) {
        try {
          const inviteRes = await inviteTeam(createdTeamId, email);
          inviteResults.push({
            email,
            success: inviteRes.success,
            message: inviteRes.message
          });
        } catch (error) {
          inviteResults.push({
            email,
            success: false,
            message: "Failed to send invite"
          });
        }
      }

      // Check if minimum team size can be achieved with all invites (successful + pending)
      const successfulInvites = inviteResults.filter(result => result.success);
      const totalPotentialTeamSize = successfulInvites.length + 1; // +1 for current user
      
      // For minimum team size validation, we should allow registration if enough invites were sent
      // Even if they haven't been accepted yet, the team has the potential to meet min requirements
      const totalInvitesSent = getAllTeamEmails().length;
      const totalTeamSizeWithAllInvites = totalInvitesSent + 1; // +1 for current user

      if (totalTeamSizeWithAllInvites < minTeamSize) {
        showError(`Cannot register: Need at least ${minTeamSize} team members. Send ${minTeamSize - 1} invitations (currently ${totalInvitesSent}).`);
        setLoading(false);
        return;
      }

      // Step 3: Register for Event
      const eventIdNum = Number(eventId);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        showError("Access token not found. Please login again.");
        setLoading(false);
        return;
      }
      
      const regRes = await teamRegister(eventIdNum, createdTeamId);
        
      if (!regRes.success) {
        // Don't show error for permission issues on fresh registrations
        if (regRes.message && !regRes.message.toLowerCase().includes('permission')) {
          showError(regRes.message || "Failed to register team for event.");
        } else if (regRes.message && regRes.message.toLowerCase().includes('permission')) {
          console.log('Permission error (expected for new users):', regRes.message);
        }
        setLoading(false);
        return;
      }

      // Success! Show results
      setIsRegistered(true);
      showSuccess(`Team registered successfully for ${eventName}!`);
      
      // Show invite results
      const failedInvites = inviteResults.filter(result => !result.success);
      if (failedInvites.length > 0) {
        failedInvites.forEach(failed => {
          showError(`${failed.email}: ${failed.message || 'User does not exist, ask them to create account'}`);
        });
      }

      // Fetch team members to show current state
      await fetchTeamMembers(createdTeamId);

    } catch (error: any) {
      console.error("Registration failed:", error);
      // Don't show error toast for permission issues on fresh registrations
      if (error?.message && !error.message.toLowerCase().includes('permission')) {
        showError("Registration failed. Please try again.");
      } else if (error?.message && error.message.toLowerCase().includes('permission')) {
        console.log('Permission error (expected for new users):', error.message);
      } else if (!error?.message) {
        showError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Individual invite sender (post-registration)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showError("Please enter an email address.");
      return;
    }
    if (!teamId) {
      showError("Team ID not found.");
      return;
    }
    
    setInviteLoading(true);

    try {
      const res = await inviteTeam(teamId, inviteEmail);
      if (!res.success) {
        showError(res.message === "User not found" 
          ? `${inviteEmail}: User does not exist, ask them to create account`
          : res.message || "Failed to send invite.");
        setInviteLoading(false);
        return;
      }
      showSuccess(`Invite sent successfully to ${inviteEmail}!`);
      setInviteEmail("");
      setShowInviteForm(false);
      // Refresh team members
      await fetchTeamMembers(teamId);
    } catch {
      showError("Failed to send invite.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Team size display logic
  let teamSizeDisplay = teamMaxSize;
  if (eventMinSize && eventMinSize !== teamMaxSize) {
    teamSizeDisplay = `${eventMinSize} - ${teamMaxSize}`;
  }

  // Check if user can send more invites - based on active members only
  const canSendInvite = () => {
    return currentTeamSize < maxTeamSize;
  };

  if (isLoading) return <PageLoader text="Loading..." />;

  // Show skeleton while checking registration status
  if (registrationStatus === 'checking') {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center bg-gradient-to-br from-accent-first via-accent-second to-accent-third px-4">
        {/* Toasts */}
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

        <div className="w-full max-w-3xl mx-auto py-12">
          {/* Header Card - Always show immediately */}
          <div className="bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-300/10 rounded-full flex items-center justify-center overflow-hidden p-2">
                  <Image src={eventLogo} alt="Event Logo" width={80} height={80} className="object-contain w-full h-full" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{eventName}</h1>
                  <p className="text-white/60">TEAM CREATION</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-300/10 border border-white/20 rounded px-6 py-4 text-lg font-semibold text-white shadow">
                <FaUsersGear className="w-5 h-5 text-cyan-400" />
                <span>Team Size:</span>
                <span className="font-bold">{teamSizeDisplay}</span>
              </div>
            </div>
          </div>

          {/* Skeleton Content Card */}
          <div className="w-full bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-white/60">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">Checking registration status...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center bg-gradient-to-br from-accent-first via-accent-second to-accent-third px-4">
      {/* Toasts */}
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

      <div className="w-full max-w-3xl mx-auto py-12">
        {/* Header Card */}
        <div className="bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-300/10 rounded-full flex items-center justify-center overflow-hidden p-2">
                <Image src={eventLogo} alt="Event Logo" width={80} height={80} className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{eventName}</h1>
                <p className="text-white/60">TEAM CREATION</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-300/10 border border-white/20 rounded px-6 py-4 text-lg font-semibold text-white shadow">
              <FaUsersGear className="w-5 h-5 text-cyan-400" />
              <span>Team Size:</span>
              <span className="font-bold">{teamSizeDisplay}</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="w-full bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-8">
          {!isRegistered ? (
            /* Pre-Registration Form */
            <form onSubmit={handleRegister} className="w-full space-y-6">
              {/* Team Name Input */}
              <div>
                <label className="block text-white/80 mb-2 text-lg font-medium" htmlFor="teamName">
                  Team Name
                </label>
                <div className="relative">
                  <FaUsersGear className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10" />
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-md bg-blue-300/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent text-lg"
                    placeholder="Enter your team name"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Member Email Inputs */}
              <div>
                <label className="block text-white/80 mb-2 text-lg font-medium">
                  Team Member Emails
                  <span className="text-sm text-white/60 ml-2">
                    ({memberEmails.length > 0 
                      ? `${memberEmails.length} more ${memberEmails.length === 1 ? 'member' : 'members'} needed` 
                      : 'All members selected from existing teams'
                    })
                  </span>
                </label>
                {memberEmails.length > 0 ? (
                  <div className="space-y-3">
                    {memberEmails.map((email, index) => (
                      <div key={index} className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          className="w-full pl-12 pr-20 py-3 rounded-md bg-blue-300/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder={`Team member ${index + 1} email`}
                          disabled={loading}
                        />
                        <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${
                          (index + selectedMembers.length) < minEmailsRequired 
                            ? "bg-red-500/20 text-red-300" 
                            : "bg-green-500/20 text-green-300"
                        }`}>
                          {(index + selectedMembers.length) < minEmailsRequired ? "Required" : "Optional"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-300/5 border border-white/10 rounded-md">
                    <p className="text-white/60 text-center">
                      All team positions are filled by selected existing members. 
                      {selectedMembers.length < maxEmailInputs && " Unselect some members to add new emails."}
                    </p>
                  </div>
                )}

                {/* Select from existing team members section */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExistingMembers(!showExistingMembers);
                      // Lazy load existing members only when dropdown is opened for first time
                      if (!showExistingMembers && existingMembers.length === 0) {
                        fetchExistingMembers();
                      }
                    }}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all duration-300 ease-in-out"
                    disabled={loading}
                  >
                    <Users className="w-4 h-4" />
                    <span>Select from existing team members</span>
                    <div className={`transition-all duration-300 ease-in-out transform ${
                      showExistingMembers ? 'rotate-180' : 'rotate-0'
                    }`}>
                      {showExistingMembers ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  <div 
                    className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
                      showExistingMembers 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className={`p-4 bg-blue-300/5 border border-white/10 rounded-md transform transition-all duration-300 ease-in-out ${
                      showExistingMembers 
                        ? 'translate-y-0 scale-100' 
                        : '-translate-y-2 scale-95'
                    }`}>
                      {loadingExistingMembers ? (
                        <div className="flex items-center gap-2 text-white/60">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking existing members...</span>
                        </div>
                      ) : existingMembers.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {existingMembers.map((member, index) => {
                            const isDuplicate = memberEmails.some(email => 
                              email.toLowerCase() === member.email.toLowerCase()
                            );
                            const isSelected = selectedMembers.includes(member.email);
                            
                            return (
                              <div 
                                key={index} 
                                className={`flex items-center gap-3 p-2 hover:bg-blue-300/5 rounded transition-all duration-200 ease-in-out transform ${
                                  showExistingMembers 
                                    ? 'translate-x-0 opacity-100' 
                                    : 'translate-x-2 opacity-0'
                                }`}
                                style={{
                                  transitionDelay: showExistingMembers ? `${index * 50}ms` : '0ms'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id={`member-${index}`}
                                  checked={isSelected}
                                  onChange={(e) => handleMemberSelection(member.email, e.target.checked)}
                                  disabled={isDuplicate || loading}
                                  className="w-4 h-4 text-purple-600 bg-blue-300/10 border-white/20 rounded focus:ring-purple-500 transition-all duration-200"
                                />
                                <label htmlFor={`member-${index}`} className={`flex-1 cursor-pointer transition-all duration-200 ${isDuplicate ? 'opacity-50' : 'hover:opacity-80'}`}>
                                  <div className="text-white font-medium">{member.name}</div>
                                  <div className="text-white/60 text-sm">
                                    {member.email} • from {member.teamName}
                                    {isDuplicate && " (already entered above)"}
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-white/60 text-sm">You don't have any team members. Create one.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live team size counter */}
                {(getAllTeamEmails().length > 0 || selectedMembers.length > 0) && (
                  <div className="mt-3 p-3 bg-blue-300/5 border border-white/10 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Current team size</span>
                      <span className={`font-semibold ${
                        exceedsMaxSize() ? 'text-red-400' : 
                        isMinimumSizeAchieved() ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {getTotalTeamSize()}/{maxTeamSize} members
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <div className="flex flex-col items-end gap-2">
                {!isMinimumSizeAchieved() && (
                  <div className="text-sm w-full text-red-300 text-start">
                    {getAllTeamEmails().length === 0 
                      ? `Enter at least ${minEmailsRequired} email${minEmailsRequired > 1 ? 's' : ''} or select from existing members to enable registration`
                      : `Add ${minTeamSize - (getAllTeamEmails().length + 1)} more member${minTeamSize - (getAllTeamEmails().length + 1) > 1 ? 's' : ''} to enable registration`
                    }
                  </div>
                )}
                {exceedsMaxSize() && (
                  <div className="text-sm w-full text-red-400 text-start">
                    Team size exceeds maximum limit ({maxTeamSize}). Remove some members.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !isMinimumSizeAchieved() || exceedsMaxSize()}
                  className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-3 px-8 rounded-md text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" /> : null}
                  {loading ? "Registering..." : "Register Team"}
                </button>
              </div>
            </form>
          ) : (
            /* Post-Registration Team Management */
            <div className="w-full">
              {/* Team Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaUsersGear className="w-6 h-6 text-cyan-400" />
                  {teamName}
                </div>
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Registered</span>
                </div>
              </div>

              {/* Team Members Section */}
              <div className="mb-6 p-4 bg-blue-300/5 border border-white/10 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Team Members</h3>
                  <span className="text-sm text-white/60">
                    {currentTeamSize}/{maxTeamSize} members
                  </span>
                </div>
                {teamMembersList.length > 0 ? (
                  <div className="space-y-2">
                    {teamMembersList
                      .filter(member => member.invitationStatus !== 'declined') // Hide declined members
                      .sort((a, b) => b.admin - a.admin) // Sort admin first
                      .map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-300/5 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-white/60 text-sm">
                              {member.admin ? 'Admin' : 'Member'} • {member.invitationStatus}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.admin && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                              Admin
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            member.invitationStatus === 'accepted' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {member.invitationStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">Loading team members...</p>
                )}
                
                {/* Show pending invitations message */}
                {teamMembersList.length > 0 && teamMembersList.some(member => member.invitationStatus === 'pending') && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-yellow-300 font-medium mb-1">Pending Invitations</h4>
                        <p className="text-yellow-200/80 text-sm">
                          Invitations have been sent to team members. Ask them to check their invitation box in their profile to accept and join the team.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Invite Section */}
              {canSendInvite() && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Add More Members</h3>
                    <button
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="flex items-center gap-2 bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-2 px-5 rounded-md text-md hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <FaUserPlus className="w-5 h-5" />
                      Send Invite
                    </button>
                  </div>

                  {showInviteForm && (
                    <div className="p-4 bg-blue-300/5 border border-white/10 rounded-md">
                      <form onSubmit={handleSendInvite} className="flex items-center gap-4">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email of the member you want to invite"
                          className="flex-1 px-4 py-3 rounded-md bg-blue-300/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          disabled={inviteLoading}
                        />
                        <button
                          type="submit"
                          disabled={inviteLoading}
                          className="bg-gradient-to-r from-violet-800 to-purple-600 text-white font-bold py-3 px-6 rounded-md hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {inviteLoading ? <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" /> : null}
                          {inviteLoading ? "Sending..." : "Send"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateTeamPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading..." />}>
      <CreateTeamPageContent />
    </Suspense>
  );
} 