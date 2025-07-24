import api from "@/utils/api"
import { useEffect, useState } from "react";
// import useAxiosPrivate from "./useAxiosPrivate";
import { Event } from "@/types/events";

const useEvents = () => {
    // const axiosPrivate = useAxiosPrivate()
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const getEvents = async () => {
        const res = await api.get(`/events`);
        return res.data;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            const events = await getEvents();
            setEvents(events);
            setLoading(false);
        };
        fetchEvents();
    }, []);


    return { events, loading };
}

export default useEvents;