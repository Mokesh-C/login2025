import api from "@/utils/api";
import { useEffect, useCallback } from "react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const useAxiosPrivate = () => {
    const axiosPrivate = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
    });

    const refresh = useCallback(async () => {
        if (window.location.pathname === "/login") {
            return null;
        }
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            window.location.replace("/login");
        }
        try {
            const res = await api.get(`/auth/accessToken`, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            });
            return res.data.accessToken;
        } catch (err: any) {
            console.log(err.response?.status);
            if (err.response?.status === 403) {
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("accessToken");
                window.location.replace("/login");
            }
            return null;
        }
    }, []);

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers["Authorization"]) {
                    config.headers[
                        "Authorization"
                    ] = `Bearer ${localStorage.getItem("accessToken")}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    const accessToken = await refresh();
                    
                    if (accessToken) {
                        localStorage.setItem("accessToken", accessToken);
                        axiosPrivate.defaults.headers.common[
                            "Authorization"
                        ] = `Bearer ${accessToken}`;
                        return axiosPrivate(error.config as AxiosRequestConfig);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [axiosPrivate, refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;
