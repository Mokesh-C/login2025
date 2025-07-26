// services/auth.ts
import api from '@/utils/api';

// Create user with name and mobile
export const createUser = async (name: string, mobile: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post(`/user/`, { name, mobile });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to create user',
    };
  }
};

// Update user profile after OTP verification
export const updateUser = async (
  data: { email: string; gender: string },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.patch(`/user/`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { success: true };
  } catch (err: any) {
    return {
        
      success: false,
      message: err.response?.data?.message || 'Failed to update user profile',
    };
  }
};

// Get access token using refresh token
export const getAccessToken = async (refreshToken: string): Promise<{ success: boolean; message?: string; accessToken?: string }> => {
  try {
    const res = await api.get(`/auth/accessToken`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return { success: true, accessToken: res.data.accessToken };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to get access token',
    };
  }
};

// Register student after OTP verification
export const registerStudent = async (
  data: { college: string; field: string; programme: string; year: number },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post(`/student`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to register student',
    };
  }
};

// Register alumni
export const registerAlumni = async (
  data: { userId: number; rollNo: string; currentCompany: string; currentRole: string },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post(`/alumni/`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Alumni registration failed',
    };
  }
};
