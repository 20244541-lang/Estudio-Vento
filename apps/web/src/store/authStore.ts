import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Intentar cargar usuario guardado
  const savedUser = localStorage.getItem('user');
  let initialUser = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
    } catch (e) {
      console.error('Error parseando usuario guardado');
    }
  }

  return {
    user: initialUser,
    accessToken: localStorage.getItem('accessToken') || null,
    setAuth: (user, token) => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, accessToken: token });
    },
    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, accessToken: null });
    },
  };
});
