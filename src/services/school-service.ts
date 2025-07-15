import type { School } from '@/lib/types';

const API_BASE_URL = 'https://two025-energy-event-backend.onrender.com/api';
const API_KEY = 'c815d7ba0b568849563496a6ae9b899c296b209f3d66283d27435d4bba9d794f';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
};

export const getSchools = async (): Promise<School[]> => {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    headers: getHeaders(),
    cache: 'no-store', // Ensure fresh data
  });
  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }
  const data = await response.json();
  return data.data;
};

export const createSchool = async (schoolData: { name: string; address: string }): Promise<School> => {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(schoolData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create school');
  }
  const data = await response.json();
  return data.data;
};

export const updateSchool = async (id: string, schoolData: Partial<{ name: string; address: string }>): Promise<School> => {
  const response = await fetch(`${API_BASE_URL}/schools/mongo/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(schoolData),
  });
  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update school');
  }
   const data = await response.json();
  return data.data;
};

export const deleteSchool = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/schools/mongo/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete school');
  }
  return await response.json();
};
