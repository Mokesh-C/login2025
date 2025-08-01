import api from '@/utils/api';

const useRegister = () => {
  // Solo registration
  const soloRegister = async (eventId: number, accessToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post('/registration', { eventId }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to register for event',
      };
    }
  };

  // Team registration
  const teamRegister = async (eventId: number, teamId: number, accessToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post('/registration', { eventId, teamId }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to register team for event',
      };
    }
  };

  // Get registration by ID
  const getRegistrationById = async (registrationId: number, accessToken: string): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await api.get(`/registration/${registrationId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch registration',
      };
    }
  };

  // Get registrations by user
  const getRegistrationsByUser = async (accessToken: string): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await api.get(`/registration/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch user registrations',
      };
    }
  };

  // Get registrations by event ID
  const getRegistrationsByEventId = async (eventId: number, accessToken: string): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await api.get(`/registration/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch event registrations',
      };
    }
  };

  // Get registrations by team ID
  const getRegistrationsByTeamId = async (teamId: number, accessToken: string): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const res = await api.get(`/registration/team/${teamId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch team registrations',
      };
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