
import type { MatchAPI, CreateMatchPayload, UpdateMatchPayload, User } from '@/lib/types';

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
  
  // Fallback to static key for public or unauthenticated requests
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

export const getMatches = async (): Promise<MatchAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATIC_API_KEY, // Public endpoint can use static key
    },
    cache: 'no-store',
  });
  const data = await handleResponse(response);
  return data.data;
};

export const createMatch = async (payload: CreateMatchPayload): Promise<MatchAPI> => {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    method: 'POST',
    headers: getHeaders(), // Uses dynamic key if available
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const updateMatch = async (id: string, payload: UpdateMatchPayload): Promise<MatchAPI> => {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
    method: 'PATCH',
    headers: getHeaders(), // Uses dynamic key if available
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const deleteMatch = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
    method: 'DELETE',
    headers: getHeaders(), // Uses dynamic key if available
  });
  const data = await handleResponse(response);
  return data;
};
