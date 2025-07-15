import type { MatchAPI, CreateMatchPayload, UpdateMatchPayload } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
};

export const getMatches = async (): Promise<MatchAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  const data = await response.json();
  return data.data;
};

export const createMatch = async (payload: CreateMatchPayload): Promise<MatchAPI> => {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create match');
  }
  const data = await response.json();
  return data.data;
};

export const updateMatch = async (id: string, payload: UpdateMatchPayload): Promise<MatchAPI> => {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update match');
  }
  const data = await response.json();
  return data.data;
};

export const deleteMatch = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error('Failed to delete match');
  }
  return await response.json();
};
