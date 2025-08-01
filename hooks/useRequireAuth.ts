import { useEffect, useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import { User } from "@/types/user";

const useRequireAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
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