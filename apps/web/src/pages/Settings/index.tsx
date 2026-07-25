import { useQuery } from '@tanstack/react-query';
import { Settings as SettingsIcon, Users, Building, Shield } from 'lucide-react';
import { userService } from '../../services/subCaseServices';
import { Button } from '../../components/ui/button';

export default function Settings() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2 text-primary" />
          Configuración del Bufete
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra los usuarios, permisos y preferencias de tu firma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Settings */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-primary text-primary-foreground font-medium rounded-md shadow-sm">
            <Users className="h-5 w-5 mr-3" /> Usuarios
          </button>
          <button className="w-full flex items-center px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium rounded-md transition-colors">
            <Building className="h-5 w-5 mr-3" /> Datos de la Firma
          </button>
          <button className="w-full flex items-center px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium rounded-md transition-colors">
            <Shield className="h-5 w-5 mr-3" /> Seguridad
          </button>
        </div>

        {/* Content Panel */}
        <div className="col-span-1 md:col-span-3 bg-card shadow-soft rounded-xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Gestión de Usuarios</h2>
            <Button size="sm">Invitar Usuario</Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Correo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role?.name || 'Usuario'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Información del Sistema</h3>
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p>Estudio Jurídico Vento & Asociados — Sistema de Gestión Legal v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
