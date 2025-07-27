"use client";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import React, { useEffect } from "react";
import { PageLoader } from "@/components/LoadingSpinner";

function page() {
    const axiosPrivate = useAxiosPrivate();
    const { user, isLoading } = useAuth();

    if (isLoading) return <PageLoader text="Loading user data..." />;
    return <div>{user?.name}</div>;
}

export default page;
