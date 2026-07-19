import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, ArrowRight } from 'lucide-react';
import { caseService } from '../../services/caseService';
import { Button } from '../../components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAll,
  });

  const activeCases = cases?.filter((c: any) => c.status === 'OPEN') || [];
  const recentCases = cases?.slice(0, 5) || []; // Top 5 más recientes (ya vienen ordenados desc por la API)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de la actividad de tu firma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Casos Activos</h3>
            <p className="text-3xl font-bold text-primary">{isLoading ? '...' : activeCases.length}</p>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Total de expedientes en curso
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Audiencias de Hoy</h3>
            <p className="text-3xl font-bold text-warning">0</p>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Sincronización con calendario pendiente
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-soft border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Plazos Vencidos</h3>
            <p className="text-3xl font-bold text-destructive">0</p>
          </div>
          <div className="mt-4 text-sm text-success">
            Todo al día
          </div>
        </div>
      </div>

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
                  <li key={c.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
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

        {/* Plantillas Destacadas */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Plantillas Frecuentes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/templates')} className="text-primary">
              Ir a Plantillas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
            <ul className="divide-y divide-border">
              <li className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate('/templates')}>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-500 bg-orange-100 p-1.5 rounded-lg mr-4" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Demanda de Alimentos Básica</p>
                    <p className="text-xs text-muted-foreground">Familia • DOCX</p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate('/templates')}>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500 bg-blue-100 p-1.5 rounded-lg mr-4" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Contrato de Arrendamiento Comercial</p>
                    <p className="text-xs text-muted-foreground">Civil • DOCX</p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate('/templates')}>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-500 bg-purple-100 p-1.5 rounded-lg mr-4" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Contestación de Demanda</p>
                    <p className="text-xs text-muted-foreground">Laboral • DOCX</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
