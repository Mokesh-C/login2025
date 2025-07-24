import api from "@/utils/api"
import { useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";

const useEvents = () => {
    const axiosPrivate = useAxiosPrivate()


    const getEvents = async () => {
        const res = await api.get(`/events`);
        return res.data;
    };


    return { getEvents };
}

export default useEvents;