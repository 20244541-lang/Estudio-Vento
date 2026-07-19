import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Clients from './pages/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import Cases from './pages/Cases';
import CaseDetail from './pages/Cases/CaseDetail';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/cases" 
          element={
            <PrivateRoute>
              <Cases />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/cases/:id" 
          element={
            <PrivateRoute>
              <CaseDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/clients" 
          element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/clients/:id" 
          element={
            <PrivateRoute>
              <ClientDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/templates" 
          element={
            <PrivateRoute>
              <Templates />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } 
        />
        {/* Futuras rutas irán aquí, envueltas en PrivateRoute */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
