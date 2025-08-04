import api from '@/utils/api';
import { useState, useCallback } from 'react';

const useTeam = () => {
  // Shared token state for all methods
  const [accessToken, setAccessToken] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  );

  // Token refresh logic (same as useAxiosPrivate)
  const refreshToken = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.replace("/login");
      return null;
    }
    
    try {
      const res = await api.get('/auth/accessToken', {
        headers: { Authorization: `Bearer ${refreshToken}` }
      });
      
      const newToken = res.data.accessToken;
      setAccessToken(newToken); // Update shared state
      localStorage.setItem('accessToken', newToken);
      return newToken;
    } catch (err: any) {
      if (err.response?.status === 403) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        window.location.replace("/login");
      }
      return null;
    }
  }, []);

  // Generic authenticated request handler
  const makeAuthenticatedRequest = useCallback(async (requestConfig: any) => {
    try {
      // Get token from state or localStorage
      const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      
      if (!token) {
        throw new Error('No access token available');
      }

      // First attempt with current token
      const response = await api.request({
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      // If 401, refresh token and retry
      if (error.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token (newToken is already in state)
          return await api.request({
            ...requestConfig,
            headers: {
              ...requestConfig.headers,
              Authorization: `Bearer ${newToken}`
            }
          });
        }
      }
      throw error;
    }
  }, [accessToken, refreshToken]);

  // Helper function for consistent error handling
  const handleApiError = (err: any, defaultMessage: string) => ({
    success: false,
    message: err.response?.data?.message || defaultMessage
  });
  // Create a new team - NO accessToken parameter!
  const createTeam = async (name: string): Promise<{ success: boolean; message?: string; teamId?: number }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'POST',
        url: '/teams/create-team',
        data: { name },
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Check if the response contains an error message even with 2xx status
      if (res.data?.message && (
        res.data.message.toLowerCase().includes('already exists') ||
        res.data.message.toLowerCase().includes('error') ||
        !res.data.teamId
      )) {
        return { success: false, message: res.data.message };
      }
      
      return { success: true, teamId: res.data?.teamId };
    } catch (err: any) {
      console.error("Create team error:", err.response?.data);
      return handleApiError(err, 'Failed to create team');
    }
  };

  // Invite a member to a team - NO accessToken parameter!
  const inviteTeam = async (teamId: number, email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'POST',
        url: `/teams/${teamId}/invite`,
        data: { email },
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Check if the response contains an error message even with status 200
      if (res.data?.message && res.data.message.toLowerCase().includes('does not exist')) {
        return { success: false, message: res.data.message };
      }
      
      return { success: true };
    } catch (err: any) {
      return handleApiError(err, 'Failed to invite member');
    }
  };

  // Get all teams for the user - NO accessToken parameter!
  const userTeams = async (): Promise<{ success: boolean; message?: string; teams?: any[] }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: '/teams/user-teams'
      });
      return { success: true, teams: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch user teams');
    }
  };

  // Get all members of a team - NO accessToken parameter!
  const teamMembers = async (teamId: number): Promise<{ success: boolean; message?: string; members?: any[] }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: `/teams/${teamId}/members`
      });
      return { success: true, members: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch team members');
    }
  };

  // Update invitation status - NO accessToken parameter!
  const updateInvitation = async (teamId: number, userId: number, status: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await makeAuthenticatedRequest({
        method: 'PATCH',
        url: `/teams/${teamId}/invitation`,
        data: { userId, status },
        headers: { 'Content-Type': 'application/json' }
      });
      return { success: true };
    } catch (err: any) {
      return handleApiError(err, 'Failed to update invitation');
    }
  };

  return { createTeam, inviteTeam, userTeams, teamMembers, updateInvitation };
};

export default useTeam; 