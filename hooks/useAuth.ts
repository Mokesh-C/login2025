import api from "@/utils/api"



const useAuth = () => {
    // Send OTP for login
    const sendOtp = async (mobile: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await api.post(`/auth/sendMobileOTP`, { mobile });
            return { success: true };
        } catch (err: any) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    // Verify OTP for login
    const verifyOtp = async (mobile: string, otp: string): Promise<{ success: boolean; message?: string; refreshToken?: string }> => {
        try {
            const res = await api.post(`/auth/authMobile`, { mobile, otp });
            return { success: true, refreshToken: res.data.refreshToken };
        } catch (err: any) {
            return {
                success: false,
                message: err.response?.data?.message || 'OTP verification failed',
            };
        }
    };

    // Get access token using refresh token
    const getAccessToken = async (refreshToken: string): Promise<{ success: boolean; message?: string; accessToken?: string }> => {
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

    // Register participant after OTP verification
    const registerParticipant = async (formData: FormData): Promise<{ success: boolean; message?: string }> => {
        try {
            await api.post(`/user/participant`, formData, {
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
    const createUser = async (name: string, mobile: string): Promise<{ success: boolean; message?: string }> => {
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
    const updateUser = async (
        data: { email: string; gender: string; avatarUrl: string; accommodation: number; foodPreference: string },
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
            console.log(err.response.data.message);

            return {
                success: false,
                message: err.response?.data?.message || 'Failed to update user profile',
            };
        }
    };

    // Register student after OTP verification
    const registerStudent = async (
        data: { college: string; field: string; programme: string; year: string },
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

    const registerAlumni = async (
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

    const logout = async (accessToken: string) => {
        await api.delete(`/auth/logout`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    };
    return {
        sendOtp,
        verifyOtp,
        getAccessToken,
        registerParticipant,
        createUser,
        updateUser,
        registerStudent,
        registerAlumni,
        logout,
    };
}

export default useAuth;