import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, Users, Briefcase } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Buscar
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
            placeholder="Buscar casos, clientes, documentos..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative hidden sm:block" ref={menuRef}>
            <Button 
              variant="default" 
              size="sm" 
              className="shadow-soft flex items-center"
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo
            </Button>
            
            {isNewMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center transition-colors"
                  onClick={() => { setIsNewMenuOpen(false); navigate('/clients?new=true'); }}
                >
                  <Users className="mr-3 h-4 w-4 text-muted-foreground" /> Nuevo Cliente
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center transition-colors"
                  onClick={() => { setIsNewMenuOpen(false); navigate('/cases?new=true'); }}
                >
                  <Briefcase className="mr-3 h-4 w-4 text-muted-foreground" /> Nuevo Expediente
                </button>
              </div>
            )}
          </div>
          
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground">
            <span className="sr-only">Ver notificaciones</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
