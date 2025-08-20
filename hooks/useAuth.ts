"use client";
import api from "@/utils/api"
import useAxiosPrivate from "./useAxiosPrivate";
import { useEffect, useState } from "react";
import { User } from "@/types/user";



const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const axiosPrivate = useAxiosPrivate();


    // useEffect(() => {
    //     const fetchAuth = async () => {
    //         const user = await axiosPrivate.get("/user");
    //         setUser(user.data);
    //         setIsLoading(false);
    //     };
    //     fetchAuth();
    // }, []);

    // Send OTP for login
    const sendOtp = async (
        mobile: string
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            await api.post(`/auth/sendMobileOTP`, { mobile });
            return { success: true };
        } catch (err: any) {
            return {
                success: false,
                message: err.response?.data?.message || "Failed to send OTP",
            };
        }
    };

    // Verify OTP for login
    const verifyOtp = async (
        mobile: string,
        otp: string
    ): Promise<{
        success: boolean;
        message?: string;
        refreshToken?: string;
    }> => {
        try {
            const res = await api.post(`/auth/authMobile`, { mobile, otp });
            localStorage.setItem("refreshToken", res.data.refreshToken);
            return { success: true, refreshToken: res.data.refreshToken };
        } catch (err: any) {
            return {
                success: false,
                message:
                    err.response?.data?.message || "OTP verification failed",
            };
        }
    };

    const logout = async (refreshToken: string) => {
        await api.delete(`/auth/logout`, {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
    };

    // Public lookup: get user by mobile (no token required)
    const getByMobile = async (
        mobile: number
    ): Promise<{ success: boolean; data?: User; message?: string }> => {
        try {
            const res = await api.get(`/user/mobile/${mobile}`);
            return { success: true, data: res.data as User };
        } catch (err: any) {
            return {
                success: false,
                message: err?.response?.data?.message || "User not found",
            };
        }
    };

    const getUser = async (accessToken: string) => {
        if (!accessToken) {
            return;
        }
        const res = await api.get(`/user`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        setUser(res.data);
        return res.data;
    };

    return {
        sendOtp,
        verifyOtp,
        logout,
        getByMobile,
        user,
        isLoading,
    };
}

export default useAuth;