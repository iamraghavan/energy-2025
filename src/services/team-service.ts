import type { Team, TeamPayload, User } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const STATIC_API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';


const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      if (user.apiKey) {
        headers['x-api-key'] = user.apiKey;
        return headers;
      }
    }
  } catch (e) {
    console.error("Could not parse user from localStorage for API key", e)
  }
  
  headers['x-api-key'] = STATIC_API_KEY;
  return headers;
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

export const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATIC_API_KEY,
    },
    cache: 'no-store',
  });
  const data = await handleResponse(response);
  return data.data;
};

export const getTeamById = async (id: string): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATIC_API_KEY,
    },
    cache: 'no-store',
  });
  const data = await handleResponse(response);
  return data.data;
};

export const createTeam = async (teamData: TeamPayload): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(teamData),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const updateTeam = async (id: string, teamData: Partial<TeamPayload>): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(teamData),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const deleteTeam = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return await handleResponse(response);
};
