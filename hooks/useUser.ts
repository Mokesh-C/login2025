import api from '@/utils/api';

const useUser = () => {

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
        data: { email: string; gender: string;},
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


    const refreshAccessToken = async (refreshToken: string) => {
        const res = await api.get(`/auth/accessToken`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshToken}`,
            },
        });
        return res.data.accessToken;
    };

    const getUser = async (accessToken: string) => {
        const res = await api.get('/user', { 
            headers: { Authorization: `Bearer ${accessToken}` } 
        });
        return res.data;
    };

    return { refreshAccessToken, registerParticipant, createUser, updateUser, registerStudent, registerAlumni, getUser };
}
export default useUser;
