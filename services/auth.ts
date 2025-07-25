// services/auth.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Send OTP for login
export const sendOtp = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.post(`${API_BASE}/auth/sendMobileOTP`, { mobile });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to send OTP',
    };
  }
};

// Verify OTP for login
export const verifyOtp = async (mobile: string, otp: string): Promise<{ success: boolean; message?: string; refreshToken?: string }> => {
  try {
    const res = await axios.post(`${API_BASE}/auth/authMobile`, { mobile, otp });
    return { success: true, refreshToken: res.data.refreshToken };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'OTP verification failed',
    };
  }
};

// Get access token using refresh token
export const getAccessToken = async (refreshToken: string): Promise<{ success: boolean; message?: string; accessToken?: string }> => {
  try {
    const res = await axios.get(`${API_BASE}/auth/accessToken`, {
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

// Register participant after OTP verification
export const registerParticipant = async (formData: FormData): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.post(`${API_BASE}/user/participant`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Registration failed',
    };
  }
};

// Create user with name and mobile
export const createUser = async (name: string, mobile: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.post(`${API_BASE}/user/`, { name, mobile });
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
  data: { email: string; gender: string; avatarUrl: string; accommodation: number; foodPreference: string },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.patch(`${API_BASE}/user/`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { success: true };
  } catch (err: any) {
    console.log(err.response.data.message);

    return {
      success: false,
      message: err.response?.data?.message || 'Failed to update user profile',
    };
  }
};

// Register student after OTP verification
export const registerStudent = async (
  data: { college: string; field: string; programme: string; year: string },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.post(`${API_BASE}/student`, data, {
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

export const registerAlumni = async (
  data: { userId: number; rollNo: string; currentCompany: string; currentRole: string },
  accessToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.post(`${API_BASE}/alumni/`, data, {
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

export const logout = async (accessToken: string) => {
  await axios.delete(`${API_BASE}/auth/logout`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
