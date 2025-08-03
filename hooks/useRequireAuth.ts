import { useEffect, useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import { User } from "@/types/user";

const useRequireAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        // Only fetch user data if refresh token exists
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await axiosPrivate.get("/user");
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { user, isLoading };
};

export default useRequireAuth; 