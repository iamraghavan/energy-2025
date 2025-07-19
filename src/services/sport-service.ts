import type { SportAPI } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
};

async function handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } else {
      const text = await response.text();
       if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      return { data: text };
    }
}

export const getSports = async (): Promise<SportAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/sports`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  const data = await handleResponse(response);
  
  // The API returns sports grouped by gender, so we need to flatten them.
  const allSports: SportAPI[] = [];
  if (data.data.menSports) {
    allSports.push(...data.data.menSports);
  }
   if (data.data.womenSports) {
    allSports.push(...data.data.womenSports);
  }

  // Use a Map to ensure unique sports based on their name, preferring the one from menSports if names are identical.
  const uniqueSportsMap = new Map<string, SportAPI>();
  allSports.forEach(sport => {
    if (!uniqueSportsMap.has(sport.name)) {
        uniqueSportsMap.set(sport.name, sport);
    }
  });
  
  return Array.from(uniqueSportsMap.values());
};
