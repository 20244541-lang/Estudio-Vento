import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, CalendarDays, Files, Settings, Library, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-primary text-primary-foreground shadow-lg transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('flex h-16 items-center px-3 relative', collapsed ? 'justify-center' : 'justify-between px-5')}>
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-tight truncate">Estudio Vento</h1>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors text-white flex-shrink-0',
            collapsed && 'mx-auto'
          )}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              )
            }
          >
            <item.icon className={cn('h-5 w-5 flex-shrink-0', !collapsed && 'mr-3')} aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}

        {user?.role === 'Admin' && (
          <NavLink
            to="/settings"
            title={collapsed ? 'Configuración' : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              )
            }
          >
            <Settings className={cn('h-5 w-5 flex-shrink-0', !collapsed && 'mr-3')} aria-hidden="true" />
            {!collapsed && <span>Configuración</span>}
          </NavLink>
        )}
      </nav>

      {/* Footer usuario */}
      <div className={cn('border-t border-blue-800 p-3', collapsed ? 'flex justify-center' : '')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : '')}>
          <div
            className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm"
            title={collapsed ? `${user?.name} (${user?.role})` : undefined}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-blue-200 truncate">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
