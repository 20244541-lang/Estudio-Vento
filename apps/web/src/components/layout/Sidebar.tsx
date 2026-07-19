import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, CalendarDays, Files, Settings, Library } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Casos', href: '/cases', icon: Briefcase },
  { name: 'Calendario', href: '/calendar', icon: CalendarDays },
  { name: 'Documentos', href: '/documents', icon: Files },
  { name: 'Plantillas', href: '/templates', icon: Library },
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <div className="flex h-full w-64 flex-col bg-primary text-primary-foreground shadow-lg">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-2xl font-bold tracking-tight">ERP Legal</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}

        {user?.role === 'Admin' && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              )
            }
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Configuración
          </NavLink>
        )}
      </nav>
      
      <div className="border-t border-blue-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs font-medium text-blue-200">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
