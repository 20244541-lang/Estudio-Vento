import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase, Eye, Search, X, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import CaseForm from './CaseForm';
import { exportToCSV } from '../../utils/exportCSV';

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta',
};
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'text-red-700 bg-red-100',
  MEDIUM: 'text-yellow-700 bg-yellow-100',
  LOW: 'text-green-700 bg-green-100',
};

export default function Cases() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, priorityFilter]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cases', page, searchTerm, statusFilter, priorityFilter],
    queryFn: () => caseService.getAll({
      page,
      limit: 20,
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
    }),
  });

  const cases = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleFormClose = (shouldRefetch: boolean) => {
    setIsFormOpen(false);
    if (shouldRefetch) refetch();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const hasFilters = searchTerm || statusFilter || priorityFilter;

  const handleExport = () => {
    if (!cases.length) return;
    exportToCSV(
      'expedientes',
      ['N° Interno', 'N° Judicial', 'Cliente', 'Materia', 'Prioridad', 'Estado', 'Fecha Inicio'],
      cases.map((c: any) => [
        c.internalNumber, c.docketNumber || '',
        c.client?.name || '', c.specialty?.name || '',
        PRIORITY_LABELS[c.priority] || c.priority,
        c.status === 'OPEN' ? 'Abierto' : 'Cerrado',
        c.startDate ? new Date(c.startDate).toLocaleDateString('es-PE') : '',
      ])
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expedientes (Casos)</h1>
          <p className="text-muted-foreground mt-1">
            {total > 0 ? `${total} expediente${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Gestiona todos los expedientes legales.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!cases.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Expediente
          </Button>
        </div>
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden flex flex-col">
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por N° Interno, N° Judicial, Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-input rounded-md bg-transparent text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro Estado */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="OPEN">Abierto</option>
              <option value="CLOSED">Cerrado</option>
            </select>

            {/* Filtro Prioridad */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="">Todas las prioridades</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-destructive underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando expedientes...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {hasFilters ? 'No se encontraron expedientes con los filtros aplicados.' : 'No hay expedientes registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border table-fixed">
              <thead className="bg-muted">
                <tr>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">N° Interno</th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Materia</th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridad</th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="w-[12%] px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {cases.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex items-center">
                        <Briefcase className="flex-shrink-0 h-5 w-5 text-primary mr-3" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-bold text-primary truncate">{c.internalNumber}</span>
                          {c.docketNumber && (
                            <span className="text-xs text-muted-foreground mt-0.5 truncate">Exp: {c.docketNumber}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground overflow-hidden">
                      <span className="truncate block" title={c.client?.name}>{c.client?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm text-foreground font-medium truncate">
                          {c.specialty?.name || 'General'}
                          {c.tags && c.tags.length > 0 && <span className="text-primary font-bold"> — {c.tags[0]}</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_COLORS[c.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {PRIORITY_LABELS[c.priority] || c.priority}
                      </span>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {total} expedientes
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <CaseForm onClose={handleFormClose} />
      )}
    </div>
  );
}
