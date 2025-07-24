import api from '@/utils/api';

const useUser = () => {
    const getUser = async (accessToken: string) => {
        const res = await api.get(`/user`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return res.data;
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

    return { getUser, refreshAccessToken };
}

export default useUser;