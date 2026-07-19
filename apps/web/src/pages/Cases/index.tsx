import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import CaseForm from './CaseForm';

export default function Cases() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAll,
  });

  const handleFormClose = (shouldRefetch: boolean) => {
    setIsFormOpen(false);
    if (shouldRefetch) {
      refetch();
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expedientes (Casos)</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza y gestiona todos los problemas legales de tus clientes.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Expediente
        </Button>
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando expedientes...</div>
        ) : cases?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay expedientes registrados.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Número Interno</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Materia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {cases?.map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Briefcase className="flex-shrink-0 h-5 w-5 text-primary mr-3" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">{c.internalNumber}</span>
                        <span className="text-xs text-foreground truncate max-w-[250px]" title={c.description}>
                          {c.description || 'Sin descripción'}
                        </span>
                        {c.docketNumber && (
                          <span className="text-xs text-muted-foreground mt-0.5">Exp. Jud: {c.docketNumber}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {c.client?.name || 'Cargando...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground font-medium">
                        {c.specialty?.name || 'General'}
                        {c.tags && c.tags.length > 0 && <span className="text-primary font-bold"> — {c.tags[0]}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.entity?.name || 'No especificada'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-900" onClick={() => navigate(`/cases/${c.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <CaseForm onClose={handleFormClose} />
      )}
    </div>
  );
}
