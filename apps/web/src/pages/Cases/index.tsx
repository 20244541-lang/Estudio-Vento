import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase, Eye, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import CaseForm from './CaseForm';

export default function Cases() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true');
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredCases = cases?.filter((c: any) => {
    const term = searchTerm.toLowerCase();
    const searchString = `${c.internalNumber} ${c.docketNumber || ''} ${c.client?.name || ''} ${c.specialty?.name || ''} ${c.tags?.[0] || ''}`.toLowerCase();
    return searchString.includes(term);
  });

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

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden flex flex-col">
        {/* Barra de Búsqueda */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por N° Interno, N° Judicial, Cliente o Materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando expedientes...</div>
        ) : filteredCases?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron expedientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border table-fixed">
              <thead className="bg-muted">
                <tr>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">N° Interno</th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Materia</th>
                  <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="w-[15%] px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredCases?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex items-center">
                        <Briefcase className="flex-shrink-0 h-5 w-5 text-primary mr-3" />
                        <div className="flex flex-col overflow-hidden text-ellipsis">
                          <span className="text-sm font-bold text-primary truncate">{c.internalNumber}</span>
                          {c.docketNumber && (
                            <span className="text-xs text-muted-foreground mt-0.5 truncate">Exp: {c.docketNumber}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground overflow-hidden text-ellipsis">
                      <span className="truncate block" title={c.client?.name}>{c.client?.name || 'Cargando...'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex flex-col overflow-hidden text-ellipsis">
                        <span className="text-sm text-foreground font-medium truncate" title={`${c.specialty?.name || 'General'}${c.tags && c.tags.length > 0 ? ` — ${c.tags[0]}` : ''}`}>
                          {c.specialty?.name || 'General'}
                          {c.tags && c.tags.length > 0 && <span className="text-primary font-bold"> — {c.tags[0]}</span>}
                        </span>
                        <span className="text-xs text-muted-foreground truncate" title={c.entity?.name}>{c.entity?.name || 'No especificada'}</span>
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
                        Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <CaseForm onClose={handleFormClose} />
      )}
    </div>
  );
}
