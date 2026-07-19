import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users as UsersIcon, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { clientService } from '../../services/clientService';
import ClientForm from './ClientForm';

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true');
  const [editingClient, setEditingClient] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
      // Remove 'new' param so it doesn't reopen on refresh if they close it
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll,
  });

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

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

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Directorio de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus clientes, su información de contacto y casos asociados.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando clientes...</div>
        ) : clients?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay clientes registrados. Haz clic en "Nuevo Cliente" para comenzar.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  DNI/RUC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {clients?.map((client: any) => (
                <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold mr-3">
                        {client.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {client.documentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{client.email || 'Sin correo'}</span>
                      <span className="text-xs">{client.phone || 'Sin teléfono'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary hover:text-blue-900" 
                      onClick={() => navigate(`/clients/${client.id}`)}
                      title="Ver Detalles y Casos"
                    >
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

      {isFormOpen && (
        <ClientForm 
          client={editingClient} 
          onClose={(shouldRefetch) => handleFormClose(shouldRefetch)} 
        />
      )}
    </div>
  );
}
