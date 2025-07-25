import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const getEvents = async () => {
  const res = await axios.get(`${API_BASE}/events`);
  return res.data;
}; 