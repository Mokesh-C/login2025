import api from '@/utils/api';

const useTeam = () => {
  // Create a new team
  const createTeam = async (name: string, accessToken: string): Promise<{ success: boolean; message?: string; teamId?: number }> => {
    try {
      const res = await api.post('/teams/create-team', { name }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, teamId: res.data?.id };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create team',
      };
    }
  };

  // Invite a member to a team
  const inviteTeam = async (teamId: number, email: string, accessToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post(`/teams/${teamId}/invite`, { email }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to invite member',
      };
    }
  };

  // Get all teams for the user
  const userTeams = async (accessToken: string): Promise<{ success: boolean; message?: string; teams?: any[] }> => {
    try {
      const res = await api.get('/teams/user-teams', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, teams: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch user teams',
      };
    }
  };

  // Get all members of a team
  const teamMembers = async (teamId: number, accessToken: string): Promise<{ success: boolean; message?: string; members?: any[] }> => {
    try {
      const res = await api.get(`/teams/${teamId}/members`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, members: res.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch team members',
      };
    }
  };

  // Update invitation status
  const updateInvitation = async (teamId: number, userId: number, status: string, accessToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.patch(`/teams/${teamId}/invitation`, { userId, status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update invitation',
      };
    }
  };

  return { createTeam, inviteTeam, userTeams, teamMembers, updateInvitation };
};

export default useTeam; 