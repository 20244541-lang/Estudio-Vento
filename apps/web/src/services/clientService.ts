import { useAuthStore } from '../store/authStore';

const API_URL = 'https://estudio-vento.onrender.com/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if it's not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

function buildQueryString(params: Record<string, any>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const clientService = {
  getAll: (filters: ClientFilters = {}) =>
    fetchWithAuth(`/clients${buildQueryString({ page: 1, limit: 20, ...filters })}`),
  getById: (id: string) => fetchWithAuth(`/clients/${id}`),
  create: (data: any) => fetchWithAuth('/clients', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/clients/${id}`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/clients/${id}`, {
    method: 'DELETE',
  }),
};
