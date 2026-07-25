import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { clientService } from '../../services/clientService';
import ClientForm from './ClientForm';
import { exportToCSV } from '../../utils/exportCSV';

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true');
  const [editingClient, setEditingClient] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => clientService.getAll({ page, limit: 20, search }),
  });

  const clients = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleCreate = () => { setEditingClient(null); setIsFormOpen(true); };
  const handleEdit = (client: any) => { setEditingClient(client); setIsFormOpen(true); };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clientService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error al eliminar cliente', error);
      }
    }
  };

  const handleFormClose = (shouldRefetch = false) => {
    setIsFormOpen(false);
    if (shouldRefetch) refetch();
  };

  const handleExport = () => {
    if (!clients.length) return;
    exportToCSV(
      'clientes',
      ['Nombre', 'DNI/RUC', 'Correo', 'Teléfono', 'Dirección', 'Estado', 'Fecha Registro'],
      clients.map((c: any) => [
        c.name, c.documentId, c.email || '', c.phone || '',
        c.address || '', c.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
        new Date(c.createdAt).toLocaleDateString('es-PE'),
      ])
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Directorio de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            {total > 0 ? `${total} cliente${total !== 1 ? 's' : ''} en total` : 'Administra tus clientes y casos asociados.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!clients.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? `No se encontraron clientes con "${search}".` : 'No hay clientes registrados. Haz clic en "Nuevo Cliente" para comenzar.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">DNI/RUC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold mr-3">
                        {client.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{client.documentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{client.email || 'Sin correo'}</span>
                      <span className="text-xs">{client.phone || 'Sin teléfono'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-blue-900" onClick={() => navigate(`/clients/${client.id}`)} title="Ver Detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
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
        <ClientForm
          client={editingClient}
          onClose={(shouldRefetch) => handleFormClose(shouldRefetch)}
        />
      )}
    </div>
  );
}
