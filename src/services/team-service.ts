import type { Team, TeamPayload } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  const data = await response.json();
  // The API returns teams under a `data` property which is an array.
  return data.data;
};

export const createTeam = async (teamData: TeamPayload): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create team');
  }
  const data = await response.json();
  return data.data;
};

export const updateTeam = async (id: string, teamData: Partial<TeamPayload>): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update team');
  }
  const data = await response.json();
  return data.data;
};

export const deleteTeam = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete team');
  }
  return await response.json();
};
