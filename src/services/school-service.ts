import type { School, User } from '@/lib/types';

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

// Helper to handle API responses
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


export const getSchools = async (): Promise<School[]> => {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATIC_API_KEY,
    },
    cache: 'no-store', // Schools list might change, keep it fresh
  });
  const data = await handleResponse(response);
  return data.data;
};

export const createSchool = async (schoolData: { name: string; address: string }): Promise<School> => {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(schoolData),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const updateSchool = async (id: string, schoolData: Partial<{ name: string; address: string }>): Promise<School> => {
  const response = await fetch(`${API_BASE_URL}/schools/mongo/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(schoolData),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const deleteSchool = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/schools/mongo/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return await handleResponse(response);
};
