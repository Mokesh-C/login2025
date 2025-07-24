const useEvents = () => {
    const getEvents = async () => {
        const res = await api.get(`/events`);
        return res.data;
    };

    return { getEvents };
}

export default useEvents;