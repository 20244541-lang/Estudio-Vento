import { useAuthStore } from '../store/authStore';

const API_URL = 'https://estudio-vento.onrender.com/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { accessToken, logout } = useAuthStore.getState();
  
  const headers: any = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // Solo agregamos Content-Type si no es FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Mezclamos con los custom headers si hay
  const finalHeaders = { ...headers, ...(options.headers || {}) };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: finalHeaders });
  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('No autorizado');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Error en la petición');
  }
  return response.status === 204 ? null : response.json();
}

export const actionService = {
  getByCaseId: (caseId: string) => fetchWithAuth(`/cases/${caseId}/actions`),
  create: (caseId: string, data: any) => {
    // Si la data es FormData, no ponemos Content-Type para que el navegador ponga el boundary
    const isFormData = data instanceof FormData;
    const options: RequestInit = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    };
    if (isFormData) {
      // Necesitamos eliminar el Content-Type para FormData
      options.headers = {}; 
    }
    return fetchWithAuth(`/cases/${caseId}/actions`, options);
  },
  delete: (id: string) => fetchWithAuth(`/actions/${id}`, { method: 'DELETE' }),
};

export const expenseService = {
  getByCaseId: (caseId: string) => fetchWithAuth(`/cases/${caseId}/expenses`),
  create: (caseId: string, data: any) => fetchWithAuth(`/cases/${caseId}/expenses`, {
    method: 'POST', body: JSON.stringify(data),
  }),
  updateStatus: (id: string, status: string) => fetchWithAuth(`/expenses/${id}/status`, {
    method: 'PUT', body: JSON.stringify({ status }),
  }),
  delete: (id: string) => fetchWithAuth(`/expenses/${id}`, { method: 'DELETE' }),
};

export const deadlineService = {
  getAll: () => fetchWithAuth(`/deadlines`),
  getByCaseId: (caseId: string) => fetchWithAuth(`/cases/${caseId}/deadlines`),
  create: (caseId: string, data: any) => fetchWithAuth(`/cases/${caseId}/deadlines`, {
    method: 'POST', body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/deadlines/${id}`, { method: 'DELETE' }),
};

export const userService = {
  getAll: () => fetchWithAuth('/users'),
};

export const documentService = {
  getAll: () => fetchWithAuth('/documents'),
};
