import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { deadlineService } from '../../services/subCaseServices';
import { Button } from '../../components/ui/button';

export default function Calendar() {
  const navigate = useNavigate();
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['all-deadlines'],
    queryFn: deadlineService.getAll,
  });

  const now = new Date();
  
  // Función para determinar el estado visual del plazo
  const getDeadlineStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'text-destructive', bg: 'bg-destructive/10', text: 'Vencido', icon: AlertTriangle };
    if (diffDays === 0) return { color: 'text-warning', bg: 'bg-warning/10', text: 'Vence Hoy', icon: Clock };
    if (diffDays <= 3) return { color: 'text-orange-500', bg: 'bg-orange-100', text: `Vence en ${diffDays} días`, icon: Clock };
    return { color: 'text-success', bg: 'bg-success/10', text: `En ${diffDays} días`, icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-primary" />
            Centro de Alertas (Calendario)
          </h1>
          <p className="text-muted-foreground mt-1">
            Vista global de todos los vencimientos y plazos pendientes de la firma.
          </p>
        </div>
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando plazos...</div>
        ) : deadlines?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-success mb-3 opacity-50" />
            <p className="text-lg font-medium text-foreground">¡Todo al día!</p>
            <p>No hay plazos pendientes en ningún expediente activo.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {deadlines?.map((deadline: any) => {
              const status = getDeadlineStatus(deadline.dueDate);
              const StatusIcon = status.icon;
              
              return (
                <div key={deadline.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${status.bg} ${status.color} shrink-0`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-lg">
                          Vencimiento: {new Date(deadline.dueDate).toLocaleDateString()}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-2 sm:gap-4">
                        <span>
                          <strong className="text-foreground">Expediente:</strong> {deadline.case?.internalNumber || 'Sin número'}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          <strong className="text-foreground">Cliente:</strong> {deadline.case?.client?.name || 'Cargando...'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Plazo original: {deadline.daysCount} días {deadline.daysType === 'HABILE' ? 'hábiles' : 'calendario'}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/cases/${deadline.caseId}`)}
                    className="w-full sm:w-auto shrink-0"
                  >
                    Ir al Caso <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
