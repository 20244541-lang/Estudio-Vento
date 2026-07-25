import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, Users, Briefcase, AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deadlineService, hearingService } from '../../services/subCaseServices';

function getDaysRemaining(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function Topbar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar plazos y audiencias para notificaciones
  const { data: allDeadlines } = useQuery({
    queryKey: ['deadlines-notif'],
    queryFn: deadlineService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: upcomingHearings } = useQuery({
    queryKey: ['hearings-notif'],
    queryFn: hearingService.getUpcoming,
    staleTime: 5 * 60 * 1000,
  });

  // Plazos vencidos o por vencer en los próximos 5 días
  const urgentDeadlines = (allDeadlines || [])
    .map((d: any) => ({ ...d, daysLeft: getDaysRemaining(d.dueDate) }))
    .filter((d: any) => d.daysLeft <= 5)
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // Audiencias pendientes en los próximos 7 días
  const nearHearings = (upcomingHearings || [])
    .filter((h: any) => h.status === 'PENDING' && getDaysRemaining(h.scheduledAt) <= 7)
    .slice(0, 5);

  const totalNotifs = urgentDeadlines.length + nearHearings.length;

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Buscar</label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground" aria-hidden="true" />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
            placeholder="Buscar casos, clientes, documentos..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Botón Nuevo */}
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

          {/* 🔔 Notificaciones */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative -m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Ver notificaciones</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {totalNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                  {totalNotifs > 9 ? '9+' : totalNotifs}
                </span>
              )}
            </button>

            {/* Panel de Notificaciones */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold text-foreground">Alertas Urgentes</h3>
                  <button onClick={() => setIsNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-border">
                  {totalNotifs === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Todo al día — sin alertas urgentes</p>
                    </div>
                  ) : (
                    <>
                      {/* Plazos urgentes */}
                      {urgentDeadlines.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-red-50/50 dark:bg-red-950/20">
                            <p className="text-xs font-semibold text-destructive uppercase tracking-wide flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Plazos ({urgentDeadlines.length})
                            </p>
                          </div>
                          {urgentDeadlines.map((d: any) => (
                            <button
                              key={d.id}
                              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                              onClick={() => { setIsNotifOpen(false); navigate(`/cases/${d.caseId}`); }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${d.daysLeft < 0 ? 'bg-destructive/10' : d.daysLeft <= 2 ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                                  <AlertTriangle className={`h-3.5 w-3.5 ${d.daysLeft < 0 ? 'text-destructive' : d.daysLeft <= 2 ? 'text-orange-600' : 'text-yellow-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{d.concept}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Exp. {d.case?.internalNumber} · {d.case?.client?.name}
                                  </p>
                                  <p className={`text-xs font-semibold mt-0.5 ${d.daysLeft < 0 ? 'text-destructive' : d.daysLeft <= 2 ? 'text-orange-600' : 'text-yellow-600'}`}>
                                    {d.daysLeft < 0 ? `Venció hace ${Math.abs(d.daysLeft)} día${Math.abs(d.daysLeft) !== 1 ? 's' : ''}` : d.daysLeft === 0 ? 'Vence hoy' : `Vence en ${d.daysLeft} día${d.daysLeft !== 1 ? 's' : ''}`}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Audiencias próximas */}
                      {nearHearings.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Audiencias Próximas ({nearHearings.length})
                            </p>
                          </div>
                          {nearHearings.map((h: any) => (
                            <button
                              key={h.id}
                              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                              onClick={() => { setIsNotifOpen(false); navigate(`/cases/${h.caseId}`); }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 rounded-full bg-blue-100 flex-shrink-0">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{h.type}: {h.concept}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {h.case?.internalNumber} · {h.location || 'Sin ubicación'}
                                  </p>
                                  <p className="text-xs text-primary font-semibold mt-0.5">
                                    {new Date(h.scheduledAt).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    {' a las '}{new Date(h.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {totalNotifs > 0 && (
                  <div className="px-4 py-3 border-t border-border bg-muted/20">
                    <button
                      className="w-full text-center text-sm text-primary font-medium hover:underline"
                      onClick={() => { setIsNotifOpen(false); navigate('/calendar'); }}
                    >
                      Ver todos los plazos →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
