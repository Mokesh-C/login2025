import api from '@/utils/api';
import { useState } from 'react';

const useRegister = () => {
  // Shared token state for all methods
  const [accessToken, setAccessToken] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  );

  // Token refresh logic (same as useAxiosPrivate)
  const refreshToken = async () => {
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
  };

  // Generic authenticated request handler
  const makeAuthenticatedRequest = async (requestConfig: any) => {
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
  };

  // Helper function for consistent error handling
  const handleApiError = (err: any, defaultMessage: string) => ({
    success: false,
    message: err.response?.data?.message || defaultMessage
  });
  // Solo registration
  const soloRegister = async (eventId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await makeAuthenticatedRequest({
        method: 'POST',
        url: '/registration',
        data: { eventId },
        headers: { 'Content-Type': 'application/json' }
      });
      return { success: true };
    } catch (err: any) {
      return handleApiError(err, 'Failed to register for event');
    }
  };

  // Team registration
  const teamRegister = async (eventId: number, teamId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await makeAuthenticatedRequest({
        method: 'POST',
        url: '/registration',
        data: { eventId, teamId },
        headers: { 'Content-Type': 'application/json' }
      });
      return { success: true };
    } catch (err: any) {
      return handleApiError(err, 'Failed to register team for event');
    }
  };

  // Get registration by ID
  const getRegistrationById = async (registrationId: number): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: `/registration/${registrationId}`
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch registration');
    }
  };

  // Get registrations by user
  const getRegistrationsByUser = async (): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: '/registration/user'
      });
        
      return { success: true, data: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch user registrations');
    }
  };

  // Get registrations by event ID
  const getRegistrationsByEventId = async (eventId: number): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: `/registration/event/${eventId}`
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch event registrations');
    }
  };

  // Get registrations by team ID
  const getRegistrationsByTeamId = async (teamId: number): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await makeAuthenticatedRequest({
        method: 'GET',
        url: `/registration/team/${teamId}`
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return handleApiError(err, 'Failed to fetch team registrations');
    }
  };

  return { 
    soloRegister, 
    teamRegister, 
    getRegistrationById, 
    getRegistrationsByUser, 
    getRegistrationsByEventId, 
    getRegistrationsByTeamId 
  };
};

export default useRegister; 