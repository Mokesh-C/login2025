"use client";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import React, { useEffect } from "react";

function page() {
    const axiosPrivate = useAxiosPrivate();
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    return <div>{user?.name}</div>;
}

export default page;
