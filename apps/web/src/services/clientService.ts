import { useAuthStore } from '../store/authStore';

const API_URL = 'https://estudio-vento.onrender.com/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new ApiError(response.status, 'No autorizado');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message || 'Error en la petición');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const clientService = {
  getAll: () => fetchWithAuth('/clients'),
  getById: (id: string) => fetchWithAuth(`/clients/${id}`),
  create: (data: any) => fetchWithAuth('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/clients/${id}`, {
    method: 'DELETE',
  }),
};
