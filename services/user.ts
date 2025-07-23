import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUser = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/user`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await axios.get(`${API_BASE}/auth/accessToken`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return res.data.accessToken;
}; 