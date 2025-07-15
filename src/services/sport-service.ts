import type { SportAPI } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
};

export const getSports = async (): Promise<SportAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/sports`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sports');
  }
  const data = await response.json();
  
  // The API returns sports grouped by gender, so we need to flatten them.
  const allSports: SportAPI[] = [];
  if (data.data.male) {
    allSports.push(...data.data.male);
  }
  if (data.data.female) {
    allSports.push(...data.data.female);
  }

  // Remove duplicates by sportId
  const uniqueSports = Array.from(new Map(allSports.map(sport => [sport.sportId, sport])).values());
  
  return uniqueSports;
};
