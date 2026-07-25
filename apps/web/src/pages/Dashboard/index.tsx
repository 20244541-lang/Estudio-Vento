import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Clock, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';
import { caseService } from '../../services/caseService';
import { deadlineService, hearingService } from '../../services/subCaseServices';
import { Button } from '../../components/ui/button';

function getDaysRemaining(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const HEARING_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800' },
  HELD: { label: 'Realizada', color: 'bg-green-100 text-green-800' },
  POSTPONED: { label: 'Postergada', color: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAll({ limit: 50 }),
  });

  const cases = casesData?.data;

  const { data: allDeadlines } = useQuery({
    queryKey: ['deadlines-all'],
    queryFn: deadlineService.getAll,
  });

  const { data: upcomingHearings } = useQuery({
    queryKey: ['hearings-upcoming'],
    queryFn: hearingService.getUpcoming,
  });

  const activeCases = cases?.filter((c: any) => c.status === 'OPEN') || [];
  const recentCases = cases?.slice(0, 5) || [];

  // Plazos: solo próximos 15 días, ordenados por urgencia
  const upcomingDeadlines = (allDeadlines || [])
    .map((d: any) => ({ ...d, daysLeft: getDaysRemaining(d.dueDate) }))
    .filter((d: any) => d.daysLeft <= 15)
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
    .slice(0, 6);

  const overdueCount = (allDeadlines || []).filter(
    (d: any) => getDaysRemaining(d.dueDate) < 0
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de la actividad de tu firma.</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Casos Activos</h3>
            <p className="text-3xl font-bold text-primary">{isLoading ? '...' : activeCases.length}</p>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Total de expedientes en curso</div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Audiencias Próximas</h3>
            <p className="text-3xl font-bold text-blue-600">{upcomingHearings?.length ?? '...'}</p>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">En los próximos 30 días</div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Plazos Vencidos</h3>
            <p className={`text-3xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {overdueCount}
            </p>
          </div>
          <div className={`mt-4 text-sm ${overdueCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
            {overdueCount > 0 ? `${overdueCount} plazo${overdueCount !== 1 ? 's' : ''} requiere${overdueCount === 1 ? '' : 'n'} atención` : 'Todo al día ✓'}
          </div>
        </div>
      </div>

      {/* Fila principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Casos Recientes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Casos Recientes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-primary">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">Cargando...</div>
            ) : recentCases.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No hay casos registrados aún.</div>
            ) : (
              <ul className="divide-y divide-border">
                {recentCases.map((c: any) => (
                  <li
                    key={c.id}
                    className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <div className="flex items-center">
                      <Briefcase className="h-8 w-8 text-primary bg-primary/10 p-1.5 rounded-lg mr-4" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{c.internalNumber}</p>
                        <p className="text-xs text-muted-foreground">{c.client?.name} • {c.specialty?.name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Plazos Próximos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Plazos Próximos</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-primary">
              Ver casos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
            {!upcomingDeadlines || upcomingDeadlines.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No hay plazos urgentes en los próximos 15 días.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {upcomingDeadlines.map((d: any) => {
                  const isOverdue = d.daysLeft < 0;
                  const isUrgent = d.daysLeft >= 0 && d.daysLeft <= 3;
                  const isWarning = d.daysLeft > 3 && d.daysLeft <= 7;

                  let badgeClass = 'bg-green-100 text-green-800';
                  let IconEl = CheckCircle2;

                  if (isOverdue) { badgeClass = 'bg-red-100 text-red-800'; IconEl = AlertCircle; }
                  else if (isUrgent) { badgeClass = 'bg-orange-100 text-orange-800'; IconEl = AlertCircle; }
                  else if (isWarning) { badgeClass = 'bg-yellow-100 text-yellow-800'; IconEl = Clock; }

                  return (
                    <li
                      key={d.id}
                      className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer"
                      onClick={() => d.case?.id && navigate(`/cases/${d.case.id}`)}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-md flex-shrink-0 ${badgeClass}`}>
                          <IconEl className="h-3 w-3 mr-0.5" />
                          {isOverdue ? `-${Math.abs(d.daysLeft)}d` : `${d.daysLeft}d`}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{d.concept || 'Plazo sin concepto'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {d.case?.client?.name || 'Sin cliente'} · {new Date(d.dueDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Audiencias Próximas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Audiencias Próximas</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-primary">
            Ver casos <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
          {!upcomingHearings || upcomingHearings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay audiencias programadas en los próximos 30 días.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingHearings.map((h: any) => {
                const statusInfo = HEARING_STATUS[h.status] || HEARING_STATUS.PENDING;
                return (
                  <li
                    key={h.id}
                    className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 cursor-pointer"
                    onClick={() => h.case?.id && navigate(`/cases/${h.case.id}`)}
                  >
                    {/* Mini calendario */}
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2 text-center w-12">
                      <p className="text-xs font-medium text-muted-foreground uppercase leading-none">
                        {new Date(h.scheduledAt).toLocaleDateString('es-PE', { month: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-primary leading-tight">
                        {new Date(h.scheduledAt).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {h.type}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5 truncate">{h.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.case?.client?.name || 'Sin cliente'} · {h.case?.internalNumber} · {new Date(h.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
