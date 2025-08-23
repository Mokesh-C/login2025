"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useRequireAuth from "@/hooks/useRequireAuth";
import { PageLoader } from "@/components/LoadingSpinner";
import ToastCard from "@/components/ToastCard";
import Image from "next/image";
import { Users, Loader2, UserPlus, Mail, ChevronUp, ChevronDown, CheckCircle, User, XCircle, UserCircle } from "lucide-react";
import { FaUsersGear, FaUserPlus } from "react-icons/fa6";
import useTeam from "@/hooks/useTeam";
import useRegister from "@/hooks/useRegister";
import useEvents from "@/hooks/useEvents";
import useAuth from "@/hooks/useAuth";

// Reusable Header Card Component
const HeaderCard = ({ eventLogo, eventName, teamSizeDisplay, isRegistered }: {
  eventLogo: string;
  eventName: string;
  teamSizeDisplay: string | number;
  isRegistered: boolean;
}) => (
  <div className="bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-6 mb-8">
    <div className="flex flex-col md:flex-row  md:items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-blue-300/10 rounded-full flex items-center justify-center overflow-hidden p-2">
          <Image src={eventLogo} alt="Event Logo" width={80} height={80} className="object-contain w-full h-full rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{eventName}</h1>
          <p className="text-white/60">{isRegistered ? "Team Registration" : "Team Creation"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-blue-300/10 border border-white/20 mt-2 md:mt-0 rounded px-6 py-4 text-lg font-semibold text-white shadow">
        <FaUsersGear className="w-5 h-5 text-cyan-400" />
        <span>Team Size:</span>
        <span className="font-bold">{teamSizeDisplay}</span>
      </div>
    </div>
  </div>
);

function CreateTeamPageContent() {
  const { user, isLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get("eventId") || "";

  // Consolidated state for better management
  const [teamForm, setTeamForm] = useState({
    name: "",
    memberMobiles: [] as string[],
    mobileErrors: [] as string[],
    selectedMembers: [] as string[]
  });
  
  const [teamStatus, setTeamStatus] = useState({
    isRegistered: false,
    hasTeam: false,
    teamId: null as number | null,
    currentTeamSize: 0
  });
  
  const [uiState, setUiState] = useState({
    loading: false,
    inviteLoading: false,
    checkingRegistration: false,
    showInviteForm: false,
    showExistingMembers: false,
    loadingExistingMembers: false
  });

  // Add validation state tracking to avoid duplicate API calls
  const [validatedMobiles, setValidatedMobiles] = useState<{
    [mobile: string]: { isValid: boolean, error: string, timestamp: number }
  }>({});
  
  const [registrationStatus, setRegistrationStatus] = useState<'checking' | 'new' | 'existing' | 'error'>('checking');
  
  // Individual state variables for backward compatibility
  const [errorList, setErrorList] = useState<{ id: number; message: string }[]>([]);
  const [errorId, setErrorId] = useState(0);
  const [teamMembersList, setTeamMembersList] = useState<any[]>([]);
  const [inviteMobile, setInviteMobile] = useState("");
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  
  // Destructure for easier access
  const { name: teamName, memberMobiles, mobileErrors, selectedMembers } = teamForm;
  const { isRegistered, hasTeam, teamId, currentTeamSize } = teamStatus;
  const { loading, inviteLoading, checkingRegistration, showInviteForm, showExistingMembers, loadingExistingMembers } = uiState;
  
  // State setter functions for backward compatibility
  const setTeamName = (name: string) => setTeamForm((prev: typeof teamForm) => ({ ...prev, name }));
  const setMemberMobiles = (mobiles: string[]) => setTeamForm((prev: typeof teamForm) => ({ ...prev, memberMobiles: mobiles }));
  const setMobileErrors = (errors: string[]) => setTeamForm((prev: typeof teamForm) => ({ ...prev, mobileErrors: errors }));
  const setSelectedMembers = (members: string[]) => setTeamForm((prev: typeof teamForm) => ({ ...prev, selectedMembers: members }));
  const setIsRegistered = (registered: boolean) => setTeamStatus((prev: typeof teamStatus) => ({ ...prev, isRegistered: registered }));
  const setHasTeam = (hasTeam: boolean) => setTeamStatus((prev: typeof teamStatus) => ({ ...prev, hasTeam }));
  const setTeamId = (id: number | null) => setTeamStatus((prev: typeof teamStatus) => ({ ...prev, teamId: id }));
  const setCurrentTeamSize = (size: number) => setTeamStatus((prev: typeof teamStatus) => ({ ...prev, currentTeamSize: size }));
  const setLoading = (loading: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, loading }));
  const setInviteLoading = (loading: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, inviteLoading: loading }));
  const setCheckingRegistration = (checking: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, checkingRegistration: checking }));
  const setShowInviteForm = (show: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, showInviteForm: show }));
  const setShowExistingMembers = (show: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, showExistingMembers: show }));
  const setLoadingExistingMembers = (loading: boolean) => setUiState((prev: typeof uiState) => ({ ...prev, loadingExistingMembers: loading }));
  
  const { createTeam, teamMembers, inviteTeam, userTeams } = useTeam();
  const { teamRegister, getRegistrationsByUser } = useRegister();
  const { getByMobile } = useAuth();

  // Calculate team size constraints
  const { events } = useEvents();
  const currentEvent = events.find(e => e.id === Number(eventId));
  const eventName = currentEvent?.name || "";
  const eventLogo: string = currentEvent?.logoUrl || "";
  const minTeamSize = currentEvent?.teamMinSize ?? 1;
  const maxTeamSize = currentEvent?.teamMaxSize ?? 1;
  const maxMobileInputs = maxTeamSize - 1; // Excluding current user
  const minMobilesRequired = minTeamSize - 1; // Excluding current user

  // Initialize mobile inputs based on team size and selected members
  useEffect(() => {
    if (maxMobileInputs > 0) {
      const availableSlots = Math.max(0, maxMobileInputs - selectedMembers.length);
      const newMobiles = new Array(availableSlots).fill("");
      const newErrors = new Array(availableSlots).fill("");
      
      // Preserve existing mobile values where possible
      for (let i = 0; i < Math.min(memberMobiles.length, availableSlots); i++) {
        if (memberMobiles[i]) {
          newMobiles[i] = memberMobiles[i];
        }
      }
      
      setMemberMobiles(newMobiles);
      setMobileErrors(newErrors);
    }
  }, [maxMobileInputs, selectedMembers.length, memberMobiles.length]);

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

  // Fetch team members (for post-registration state) - OPTIMIZED
  const fetchTeamMembers = useCallback(async (teamId: number) => {
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
  }, []); // Remove teamMembers dependency to prevent recreation

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
      const memberMobiles = new Set<string>(); // To avoid duplicates

      for (const team of teamsRes.teams) {
        try {
          const membersRes = await teamMembers(team.id);
          
          if (membersRes.success && membersRes.members) {
            membersRes.members.forEach((member: any) => {
              // Skip current user and avoid duplicates
              // Use more flexible email comparison
              const currentUserMobile = user.mobile?.toLowerCase();
              const memberMobile = member.mobile?.toLowerCase();
              
              if (memberMobile && memberMobile !== currentUserMobile && !memberMobiles.has(memberMobile)) {
                memberMobiles.add(memberMobile);
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

  // Check for existing registration (memoized) - used on mount and on focus/visibility
  const checkExistingRegistration = useCallback(async (withLoader: boolean = false) => {
    if (!user) return;
    
    if (withLoader) {
      setCheckingRegistration(true);
      setRegistrationStatus('checking');
    }
    
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    if (!accessToken) {
      if (withLoader) {
        setCheckingRegistration(false);
        setRegistrationStatus('new');
      }
      setIsRegistered(false);
      return;
    }

    try {
      const regRes = await getRegistrationsByUser();
      if (!regRes.success || !regRes.data) {
        if (regRes.message && !regRes.message.toLowerCase().includes('permission')) {
          console.log('Failed to fetch registration status:', regRes.message);
        }
        if (withLoader) {
          setCheckingRegistration(false);
          setRegistrationStatus('new');
        }
        setIsRegistered(false);
        return;
      }

      const { team } = regRes.data;
      if (!team || !Array.isArray(team)) {
        if (withLoader) {
          setCheckingRegistration(false);
          setRegistrationStatus('new');
        }
        setIsRegistered(false);
        return;
      }

      // Find team registration for current event
      const currentEventId = Number(eventId);
      const existingRegistration = team.find(
        (reg: any) => reg.eventId === currentEventId && reg.teamId
      );

      if (existingRegistration && existingRegistration.teamId) {
        // User HAS a team - fetch team details and check minimum team size
        setTeamId(existingRegistration.teamId);
        setHasTeam(true);
        if (withLoader) setRegistrationStatus('existing');

        try {
          // Fetch team details in parallel for better performance
          const [membersRes, teamsRes] = await Promise.all([
            fetchTeamMembers(existingRegistration.teamId),
            userTeams()
          ]);

          // Set team name
          if (teamsRes.success && teamsRes.teams) {
            const currentTeam = teamsRes.teams.find(team => team.id === existingRegistration.teamId);
            setTeamName(currentTeam?.name || "My Team");
          } else {
            setTeamName("My Team");
          }

          // Check registration status
          if (membersRes.success && membersRes.members) {
            const acceptedMembers = membersRes.members.filter(member => 
              member.invitationStatus === 'accepted'
            );
            const acceptedCount = acceptedMembers.length;
            
            // Only show "Registered" if minimum team size is met
            setIsRegistered(acceptedCount >= minTeamSize);
          } else {
            setIsRegistered(false);
          }
        } catch (error) {
          setTeamName("My Team");
          setIsRegistered(false);
        }
      } else {
        // User NOT registered - show form immediately
        if (withLoader) setRegistrationStatus('new');
        setIsRegistered(false);
        setHasTeam(false);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
      if (withLoader) setRegistrationStatus('error');
    } finally {
      if (withLoader) setCheckingRegistration(false);
    }
  }, [user?.id, eventId, getRegistrationsByUser, userTeams, fetchTeamMembers, minTeamSize]);

  // Initial check on mount or when dependencies change
  useEffect(() => {
    if (!user || !eventId) return;
    // Initial check with loader to avoid flicker later
    checkExistingRegistration(true);
  }, [user?.id, eventId]); // Remove checkExistingRegistration dependency

  // Re-check on tab focus/visibility
  useEffect(() => {
    if (!user || !eventId) return;
    const onFocus = () => { checkExistingRegistration(false); };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkExistingRegistration(false);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.id, eventId]); // Remove checkExistingRegistration dependency

  // Cleanup old validation cache entries (older than 1 hour)
  useEffect(() => {
    const cleanupCache = () => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      setValidatedMobiles(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(mobile => {
          if (newCache[mobile].timestamp < oneHourAgo) {
            delete newCache[mobile];
          }
        });
        return newCache;
      });
    };

    const interval = setInterval(cleanupCache, 10 * 60 * 1000); // Clean every 10 minutes
    return () => clearInterval(interval);
  }, []);

  // Handle mobile input changes
  const handleMobileChange = (index: number, value: string) => {
    const newMobiles = [...memberMobiles];
    const oldMobile = newMobiles[index];
    newMobiles[index] = value;
    setMemberMobiles(newMobiles);
    
    // Clear error when user starts typing
    if (mobileErrors[index]) {
      const newErrors = [...mobileErrors];
      newErrors[index] = "";
      setMobileErrors(newErrors);
    }
    
    // Clear validation cache for the old mobile number if it changed
    if (oldMobile && oldMobile !== value) {
      clearValidationCache(oldMobile);
    }
  };

  // Validate mobile number
  const validateMobile = async (mobile: string): Promise<string> => {
    if (!mobile.trim()) return "";
    
    // Clean the mobile number (remove spaces, dashes, etc.)
    const cleanMobile = mobile.trim().replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid mobile number (10 digits)
    if (!/^\d{10}$/.test(cleanMobile)) {
      return "Mobile number must be 10 digits";
    }
    
    try {
      const res = await getByMobile(Number(cleanMobile));
      if (!res.success) {
        // Debug: Log the exact error message from backend
        console.log("Backend error message:", res.message);
        
        // Check for various "user not found" error messages from backend
        const errorMessage = res.message || "";
        const lowerErrorMessage = errorMessage.toLowerCase();
        
        if (lowerErrorMessage.includes('user not found') || 
            lowerErrorMessage.includes('user not exist') ||
            lowerErrorMessage.includes('user does not exist') ||
            lowerErrorMessage.includes('not found')) {
          return "User does not exist, ask them to create account";
        }
        
        // For any other backend error, show a generic message
        return "Failed to validate mobile number";
      }
      return ""; // No error
    } catch (error) {
      console.error("Mobile validation error:", error);
      return "Failed to validate mobile number";
    }
  };

  // Handle mobile validation on blur
  const handleMobileBlur = async (index: number, mobile: string) => {
    if (!mobile.trim()) return; // Don't validate empty fields
    
    // Skip validation if mobile is from existing team members (they're already verified)
    if (existingMembers.some(member => member.mobile === mobile)) {
      return;
    }
    
    const error = await validateMobile(mobile);
    // Normalize specific backend phrasing to a single clear message for UI
    let normalizedError = error;
    if (error) {
      const lower = error.toLowerCase();
      if (
        lower.includes('user not found') ||
        lower.includes('user does not exist') ||
        lower.includes('user not exist') ||
        lower.includes('not found')
      ) {
        normalizedError = 'User does not exist, ask them to create account';
      }
    }
    const newErrors = [...mobileErrors];
    newErrors[index] = normalizedError;
    setMobileErrors(newErrors);

    // Store validation result to avoid duplicate API calls
    setValidatedMobiles(prev => ({
      ...prev,
      [mobile]: { 
        isValid: !error, 
        error: normalizedError, 
        timestamp: Date.now() 
      }
    }));
  };

  // Handle existing member selection
  const handleMemberSelection = (mobile: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, mobile]);
    } else {
      setSelectedMembers(selectedMembers.filter(e => e !== mobile));
    }
  };

  // Clear validation cache when mobiles change
  const clearValidationCache = (mobile: string) => {
    setValidatedMobiles(prev => {
      const newCache = { ...prev };
      delete newCache[mobile];
      return newCache;
    });
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Contact picker functionality (mobile only)
  const openContactPicker = async (index: number) => {
    // Only work on mobile devices
    if (!isMobileDevice()) {
      return;
    }

    try {
      // Try to use Web Contact API (mobile browsers only)
      if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
        const contacts = await (navigator as any).contacts.select(['tel'], { multiple: false });
        if (contacts && contacts.length > 0) {
          const mobile = contacts[0].tel[0];
          // Handle different cases: team member mobile or invite mobile
          if (index === -1) {
            // Invite mobile case
            setInviteMobile(mobile);
            // Auto-validate the selected mobile
            setTimeout(() => {
              validateMobile(mobile).then(error => {
                setValidatedMobiles(prev => ({
                  ...prev,
                  [mobile]: { 
                    isValid: !error, 
                    error, 
                    timestamp: Date.now() 
                  }
                }));
              });
            }, 100);
          } else {
            // Team member mobile case
            handleMobileChange(index, mobile);
            // Auto-validate the selected mobile
            setTimeout(() => handleMobileBlur(index, mobile), 100);
          }
        }
      } else {
        // Mobile fallback: show a simple contact input modal
        const contactMobile = prompt('Enter mobile number from your contacts:');
        if (contactMobile && contactMobile.trim()) {
          if (index === -1) {
            // Invite mobile case
            setInviteMobile(contactMobile.trim());
            // Auto-validate the entered mobile
            setTimeout(() => {
              validateMobile(contactMobile.trim()).then(error => {
                setValidatedMobiles(prev => ({
                  ...prev,
                  [contactMobile.trim()]: { 
                    isValid: !error, 
                    error, 
                    timestamp: Date.now() 
                  }
                }));
              });
            }, 100);
          } else {
            // Team member mobile case
            handleMobileChange(index, contactMobile.trim());
            // Auto-validate the entered mobile
            setTimeout(() => handleMobileBlur(index, contactMobile.trim()), 100);
          }
        }
      }
    } catch (error) {
      console.log('Contact picker not supported on this mobile device');
      // Mobile fallback: show a simple contact input modal
      const contactMobile = prompt('Enter mobile number from your contacts:');
      if (contactMobile && contactMobile.trim()) {
        if (index === -1) {
          // Invite mobile case
          setInviteMobile(contactMobile.trim());
          // Auto-validate the entered mobile
          setTimeout(() => {
            validateMobile(contactMobile.trim()).then(error => {
              setValidatedMobiles(prev => ({
                ...prev,
                [contactMobile.trim()]: { 
                  isValid: !error, 
                  error, 
                  timestamp: Date.now() 
                }
              }));
            });
          }, 100);
        } else {
          // Team member mobile case
          handleMobileChange(index, contactMobile.trim());
          // Auto-validate the entered mobile
          setTimeout(() => handleMobileBlur(index, contactMobile.trim()), 100);
        }
      }
    }
  };

  // Utility functions for team management
  const getAllTeamMobiles = () => {
    const validMobiles = memberMobiles.filter(mobile => mobile.trim() !== "");
    const allMobiles = [...validMobiles, ...selectedMembers];
    return Array.from(new Set(allMobiles)); // Remove duplicates
  };

  const isMinimumSizeAchieved = () => {
    const allMobiles = getAllTeamMobiles();
    return (allMobiles.length + 1) >= minTeamSize; // +1 for current user
  };

  const getTotalTeamSize = () => {
    const allMobiles = getAllTeamMobiles();
    return allMobiles.length + 1; // +1 for current user
  };

  const getPendingInvitationsCount = () => {
    return teamMembersList.filter(member => member.invitationStatus === 'pending').length;
  };

  const getAcceptedMembersCount = () => {
    return teamMembersList.filter(member => member.invitationStatus === 'accepted').length;
  };

  const exceedsMaxSize = () => {
    return getTotalTeamSize() > maxTeamSize;
  };

  // Validation function - validates team data before registration
  const validateTeamData = async (): Promise<{ isValid: boolean; errors: string[] }> => {
    if (!teamName.trim()) {
      return { isValid: false, errors: ["Please enter a team name."] };
    }

    if (!isMinimumSizeAchieved()) {
      return { 
        isValid: false, 
        errors: [`Please enter at least ${minMobilesRequired} team member mobile${minMobilesRequired > 1 ? 's' : ''}.`] 
      };
    }

    // Validate only NEW/CHANGED mobile numbers, skip already validated ones and existing team members
    const allMobiles = getAllTeamMobiles();
    const validationErrors: string[] = [];
    
    for (let i = 0; i < allMobiles.length; i++) {
      const mobile = allMobiles[i];
      
      // Skip validation for existing team members (they're already verified)
      if (existingMembers.some(member => member.mobile === mobile)) {
        continue;
      }
      
      // Skip validation for already validated mobiles (unless they have errors)
      if (validatedMobiles[mobile] && validatedMobiles[mobile].isValid && !validatedMobiles[mobile].error) {
        continue;
      }
      
      // Only validate new/changed mobiles
      const error = await validateMobile(mobile);
      if (error) {
        validationErrors.push(`${mobile}: ${error}`);
      }
      
      // Update validation cache
      setValidatedMobiles(prev => ({
        ...prev,
        [mobile]: { 
          isValid: !error, 
          error, 
          timestamp: Date.now() 
        }
      }));
    }
    
    return { 
      isValid: validationErrors.length === 0, 
      errors: validationErrors 
    };
  };

  // Team creation and invitation function
  const createTeamAndSendInvites = async (): Promise<{ success: boolean; teamId?: number; inviteResults?: any[] }> => {
    try {
      // Step 1: Create Team
      const teamRes = await createTeam(teamName);
      if (!teamRes.success || !teamRes.teamId) {
        showError(teamRes.message || "Failed to create team.");
        return { success: false };
      }
      
      const createdTeamId = teamRes.teamId;
      setTeamId(createdTeamId);
      setHasTeam(true);
      
      // Step 2: Send Invites to all mobiles
      const allMobiles = getAllTeamMobiles();
      const invitePromises = allMobiles.map(async (mobile) => {
        try {
          const cleanMobile = mobile.trim().replace(/[\s\-\(\)]/g, '');
          const inviteRes = await inviteTeam(createdTeamId, cleanMobile);
          return {
            mobile: cleanMobile,
            success: inviteRes.success,
            message: inviteRes.message
          };
        } catch (error) {
          return {
            mobile,
            success: false,
            message: "Failed to send invite"
          };
        }
      });
      
      const inviteResults = await Promise.all(invitePromises);
      
      // Validate minimum team size
      const totalInvitesSent = getAllTeamMobiles().length;
      const totalTeamSizeWithAllInvites = totalInvitesSent + 1;

      if (totalTeamSizeWithAllInvites < minTeamSize) {
        showError(`Cannot register: Need at least ${minTeamSize} team members. Send ${minTeamSize - 1} invitations (currently ${totalInvitesSent}).`);
        return { success: false };
      }
      
      return { success: true, teamId: createdTeamId, inviteResults };
    } catch (error) {
      console.error("Team creation failed:", error);
      showError("Team creation failed. Please try again.");
      return { success: false };
    }
  };

  // Event registration function
  const registerTeamForEvent = async (teamId: number): Promise<boolean> => {
    try {
      const eventIdNum = Number(eventId);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        showError("Access token not found. Please login again.");
        return false;
      }
      
      const regRes = await teamRegister(eventIdNum, teamId);
      if (!regRes.success) {
        if (regRes.message && !regRes.message.toLowerCase().includes('permission')) {
          showError(regRes.message || "Failed to register team for event.");
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Event registration failed:", error);
      return false;
    }
  };

  // Main registration handler - orchestrates the three steps
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Step 1: Validate team data
      const validation = await validateTeamData();
      if (!validation.isValid) {
        showError(`Please fix the following errors:\n${validation.errors.join('\n')}`);
        return;
      }

      // Step 2: Create team and send invites
      const teamResult = await createTeamAndSendInvites();
      if (!teamResult.success || !teamResult.teamId) {
        return;
      }

      // Step 3: Register for event
      const registrationSuccess = await registerTeamForEvent(teamResult.teamId);
      if (!registrationSuccess) {
        return;
      }

      // Success! Handle post-registration tasks
      showSuccess(`Team created successfully for ${eventName}! Invitations have been sent.`);
      
      // Clear all inputs
      setTeamName("");
      setMemberMobiles(new Array(maxMobileInputs).fill(""));
      setMobileErrors(new Array(maxMobileInputs).fill(""));
      setSelectedMembers([]);
      
      // Show invite results
      if (teamResult.inviteResults) {
        const failedInvites = teamResult.inviteResults.filter(result => !result.success);
      if (failedInvites.length > 0) {
        failedInvites.forEach(failed => {
            // Check if backend error is "User not found" and show custom message
            if (failed.message && failed.message.toLowerCase().includes('user not found')) {
              showError(`${failed.mobile} User does not exist, ask them to create account`);
            } else {
              showError(`${failed.mobile} ${failed.message || 'Failed to send invite'}`);
            }
          });
        }
      }

      // Update page state
      await fetchTeamMembers(teamResult.teamId);
      await checkExistingRegistration(false);

    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error?.message && !error.message.toLowerCase().includes('permission')) {
        showError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Individual invite sender (post-registration)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteMobile.trim()) {
      showError("Please enter a mobile number.");
      return;
    }
    if (!teamId) {
      showError("Team ID not found.");
      return;
    }
    
    // Skip validation if mobile is from existing team members (they're already verified)
    if (existingMembers.some(member => member.mobile === inviteMobile.trim())) {
      showError("This user is already a verified team member.");
      return;
    }

    // Validate mobile number before sending invite (only for new users)
    const mobileError = await validateMobile(inviteMobile.trim());
    if (mobileError) {
      showError(`Invalid mobile number: ${mobileError}`);
      return;
    }
    
    setInviteLoading(true);

    try {
      // Clean the mobile number before sending invite
      const cleanMobile = inviteMobile.trim().replace(/[\s\-\(\)]/g, '');
      const res = await inviteTeam(teamId, cleanMobile);
      if (!res.success) {
        // Check if backend error is "User not found" and show custom message
        if (res.message && res.message.toLowerCase().includes('user not found')) {
          showError(`${cleanMobile}: User does not exist, ask them to create account`);
        } else {
          showError(res.message || "Failed to send invite.");
        }
        setInviteLoading(false);
        return;
      }
      showSuccess(`Invite sent successfully to ${cleanMobile}!`);
      setInviteMobile("");
      setShowInviteForm(false);
      // Refresh team members and re-check registration status
      await fetchTeamMembers(teamId);
      await checkExistingRegistration(false);
    } catch (error) {
      console.error("Invite error:", error);
      showError("Failed to send invite.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Team size display logic
  let teamSizeDisplay: string | number = maxTeamSize;
  if (minTeamSize && minTeamSize !== maxTeamSize) {
    teamSizeDisplay = `${minTeamSize} - ${maxTeamSize}`;
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
          <HeaderCard eventLogo={eventLogo} eventName={eventName} teamSizeDisplay={teamSizeDisplay} isRegistered={false} />

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
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center bg-gradient-to-br from-accent-first via-accent-second to-accent-third px-4 overflow-x-visible">
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
        <HeaderCard eventLogo={eventLogo} eventName={eventName} teamSizeDisplay={teamSizeDisplay} isRegistered={isRegistered} />

        {/* Main Content Card */}
        <div className="w-full bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-8">
          {!hasTeam ? (
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

              

              {/* Member Mobile Inputs */}
              <div>
                <label className="block text-white/80 mb-2 text-lg font-medium">
                  
                  <div className="flex items-center justify-between">
                      <span >Team Member Mobiles</span>
                      <span className={`font-semibold ${
                        exceedsMaxSize() ? 'text-red-400' : 
                        isMinimumSizeAchieved() ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {getTotalTeamSize()}/{maxTeamSize} members
                      </span>
                    </div>
                </label>

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
                            const isDuplicate = memberMobiles.some(mobile => 
                              mobile.toLowerCase() === member.mobile.toLowerCase()
                            );
                            const isSelected = selectedMembers.includes(member.mobile);
                            
                            return (
                              <div 
                                key={index} 
                                className={`flex items-center gap-2 hover:bg-blue-300/5 rounded transition-all duration-200 ease-in-out transform ${
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
                                  onChange={(e) => handleMemberSelection(member.mobile, e.target.checked)}
                                  disabled={isDuplicate || loading}
                                  className="w-4 h-4 text-purple-600 bg-blue-300/10 border-white/20 rounded focus:ring-purple-500 transition-all duration-200"
                                />
                                <label htmlFor={`member-${index}`} className={`flex-1 cursor-pointer transition-all duration-200 ${isDuplicate ? 'opacity-50' : 'hover:opacity-80'}`}>
                                  <div className="text-white">
                                    <span className="font-medium">{member.name}</span>
                                    <span className="text-white/60 text-sm ml-2">
                                      • {member.mobile} • from {member.teamName}
                                    {isDuplicate && " (already entered above)"}
                                    </span>
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
                
                {memberMobiles.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {memberMobiles.map((mobile, index) => (
                      <div key={index} className="relative">
                        <UserCircle 
                          className={`absolute  left-3 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10 transition-all duration-200 ${
                            isMobileDevice() 
                              ? 'cursor-pointer hover:text-cyan-300' 
                              : 'cursor-default'
                          }`}
                          style={{
                            top: mobileErrors[index] ? '33.33%' : '50%'
                          }}
                          onClick={isMobileDevice() ? () => openContactPicker(index) : undefined}
                        />
                        <input
                          type="text"
                          value={mobile}
                          onChange={(e) => handleMobileChange(index, e.target.value)}
                          onBlur={(e) => handleMobileBlur(index, e.target.value)}
                          className=" relative w-full pl-12 pr-24 py-3 rounded-md bg-blue-300/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder={`Team member ${index + 1} mobile`}
                          disabled={loading}
                        />
                        
                        {/* Verification Status Icon */}
                        <div 
                          className="absolute right-3 transform -translate-y-1/2 flex items-center gap-2 transition-all duration-200"
                          style={{
                            top: mobileErrors[index] ? '33.33%' : '50%'
                          }}
                        >
                          {mobile.trim() && (
                            <>
                              {mobileErrors[index] ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : validatedMobiles[mobile]?.isValid ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : validatedMobiles[mobile] ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              )}
                            </>
                          )}
                          
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            validatedMobiles[mobile]?.isValid 
                              ? "bg-green-500/20 text-green-300" 
                              : (index + selectedMembers.length) < minMobilesRequired 
                            ? "bg-red-500/20 text-red-300" 
                            : "bg-green-500/20 text-green-300"
                        }`}>
                            {validatedMobiles[mobile]?.isValid 
                              ? "Verified" 
                              : (index + selectedMembers.length) < minMobilesRequired 
                                ? "Required" 
                                : "Optional"
                            }
                        </span>
                        </div>
                        
                        {/* Error Message - Normal positioning for proper spacing */}
                        {mobileErrors[index] && (
                          <div className="mt-3 pl-1">
                            <p className="text-red-300 text-xs">{mobileErrors[index]}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-300/5 border border-white/10 rounded-md">
                    <p className="text-white/60 text-center">
                      All team positions are filled by selected existing members. 
                      {selectedMembers.length < maxMobileInputs && " Unselect some members to add new mobile numbers."}
                    </p>
                  </div>
                )}

                

                
              </div>

              {/* Register Button */}
              <div className="flex flex-col items-end gap-2">
                {!isMinimumSizeAchieved() && (
                  <div className="text-sm w-full text-red-300 text-start">
                    {getAllTeamMobiles().length === 0 
                      ? `Enter at least ${minMobilesRequired} mobile${minMobilesRequired > 1 ? 's' : ''} or select from existing members to enable registration`
                      : `Add ${minTeamSize - (getAllTeamMobiles().length + 1)} more member${minTeamSize - (getAllTeamMobiles().length + 1) > 1 ? 's' : ''} to enable registration`
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
                <div className={`flex items-center gap-2 rounded px-4 py-2 ${
                  isRegistered 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-yellow-500/20 border border-yellow-500/30'
                }`}>
                  {isRegistered ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Mail className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className={`font-semibold ${
                    isRegistered ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {isRegistered ? 'Registered' : 'Registration Pending'}
                  </span>
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
                        <h4 className="text-yellow-300 font-medium mb-1">
                          {getPendingInvitationsCount()} Pending Invitation{getPendingInvitationsCount() > 1 ? 's' : ''}
                        </h4>
                        <p className="text-yellow-200/80 text-sm">
                          Invitations have been sent to team members. Ask them to check their invitation box in their profile to accept and join the team.
                        </p>
                        {!isRegistered && (
                          <p className="text-yellow-200/80 text-sm mt-2 font-medium">
                            Once pending invitations are accepted, you will be automatically registered for the event.
                          </p>
                        )}
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
                        <div className="relative flex-1">
                          <UserCircle 
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10 ${
                              isMobileDevice() 
                                ? 'cursor-pointer hover:text-cyan-300 transition-colors' 
                                : 'cursor-default'
                            }`}
                            onClick={isMobileDevice() ? () => openContactPicker(-1) : undefined}
                          />
                        <input
                          type="text"
                          value={inviteMobile}
                          onChange={(e) => setInviteMobile(e.target.value)}
                            onBlur={(e) => {
                              // Validate invite mobile on blur
                              if (e.target.value.trim()) {
                                validateMobile(e.target.value.trim()).then(error => {
                                  // Store validation result for invite mobile
                                  if (e.target.value.trim()) {
                                    setValidatedMobiles(prev => ({
                                      ...prev,
                                      [e.target.value.trim()]: { 
                                        isValid: !error, 
                                        error, 
                                        timestamp: Date.now() 
                                      }
                                    }));
                                  }
                                });
                              }
                            }}
                          placeholder="Enter mobile of the member you want to invite"
                            className="w-full pl-12 pr-12 py-3 rounded-md bg-blue-300/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          disabled={inviteLoading}
                        />
                          
                          {/* Verification Status Icon for Invite Mobile */}
                          {inviteMobile.trim() && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {validatedMobiles[inviteMobile.trim()]?.isValid ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : validatedMobiles[inviteMobile.trim()]?.error ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              )}
                            </div>
                          )}
                          
                          {/* Error Message for Invite Mobile - Positioned in middle of input field when error exists */}
                          {validatedMobiles[inviteMobile.trim()]?.error && (
                            <div className="absolute left-12 top-1/3 transform -translate-y-1/2">
                              <p className="text-red-300 text-xs">{validatedMobiles[inviteMobile.trim()].error}</p>
                          </div>
                          )}
                        </div>
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
