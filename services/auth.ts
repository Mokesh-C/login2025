// services/auth.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create user
export const createUser = async (data: {
  name: string;
  mobile: string;
  email: string;
  gender: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await axios.post(`${API_BASE}/user`, data);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'User creation failed',
    };
  }
};

// Send OTP
export const requestOtp = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await axios.post(`${API_BASE}/auth/sendMobileOTP`, { mobile });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'OTP send failed',
    };
  }
};


// Resend OTP
export const resendOtp = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await axios.post(`${API_BASE}/auth/resendMobileOTP`, { mobile });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP resend failed',
      };
    }
};
  
// Verify OTP and get tokens
export const verifyOtp = async (mobile: string, otp: string): Promise<{
    success: boolean;
    message?: string;
    refreshToken?: string;
  }> => {
    try {
      const res = await axios.post(`${API_BASE}/auth/authMobile`, {
        mobile,
        otp,
      });
  
      console.log("🔐 OTP Verified Response:", res.data);
  
      return {
        success: true,
        refreshToken: res.data.refreshToken,
      };
    } catch (err: any) {
      console.error("❌ OTP Verify Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed',
      };
    }
  };
  
// Exchange refresh token for access token
export const getAccessToken = async (refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    message?: string;
  }> => {
    try {
      const res = await axios.get(`${API_BASE}/auth/accessToken`, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      return {
        success: true,
        accessToken: res.data.accessToken,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Access token fetch failed',
      };
    }
  };
  
  
  
// Submit full participant registration
export const submitParticipant = async (
    formData: FormData,
    accessToken: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await axios.post(`${API_BASE}/student`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Form submission failed',
      };
    }
  };
  