import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, Eye, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { clientService } from '../../services/clientService';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando perfil del cliente...</div>;
  }

  if (!client) {
    return <div className="p-8 text-center text-destructive">Cliente no encontrado</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al directorio
        </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tarjeta de Perfil del Cliente */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-card shadow-soft rounded-xl border border-border p-6">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-primary text-2xl font-bold mr-4">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} mt-1`}>
                    {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">DNI / RUC</p>
                    <p className="text-sm font-medium text-foreground">{client.documentId}</p>
                  </div>
                </div>
                {client.email && (
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                      <p className="text-sm font-medium text-foreground">{client.email}</p>
                    </div>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm font-medium text-foreground">{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="text-sm font-medium text-foreground">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulación visual de foto de DNI solicitada */}
            <div className="bg-card shadow-soft rounded-xl border border-border p-6">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Documento de Identidad (Foto/PDF)
              </h3>
              {client.dniPhotoUrl ? (
                client.dniPhotoUrl.toLowerCase().endsWith('.pdf') ? (
                  <a 
                    href={client.dniPhotoUrl.startsWith('http') ? client.dniPhotoUrl : `https://estudio-vento.onrender.com${client.dniPhotoUrl}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-32 border-2 border-border rounded-lg flex flex-col items-center justify-center text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                  >
                    <FileText className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Ver PDF del DNI</span>
                  </a>
                ) : (
                  <a 
                    href={client.dniPhotoUrl.startsWith('http') ? client.dniPhotoUrl : `https://estudio-vento.onrender.com${client.dniPhotoUrl}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block relative h-48 border border-border rounded-lg overflow-hidden group cursor-pointer bg-muted/30"
                  >
                    <img 
                      src={client.dniPhotoUrl.startsWith('http') ? client.dniPhotoUrl : `https://estudio-vento.onrender.com${client.dniPhotoUrl}`} 
                      alt="DNI del Cliente" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium">Ampliar Imagen</span>
                    </div>
                  </a>
                )
              ) : (
                <div className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-xs">No hay foto adjunta</span>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Casos del Cliente */}
          <div className="w-full md:w-2/3">
            <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="text-lg font-bold text-foreground flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Expedientes de {client.name}
                </h3>
                <Button size="sm" onClick={() => navigate('/cases')}>
                  + Nuevo Expediente
                </Button>
              </div>
              
              <div className="p-0 flex-grow">
                {(!client.cases || client.cases.length === 0) ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Briefcase className="h-12 w-12 opacity-20 mb-3" />
                    <p>Este cliente aún no tiene expedientes registrados.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expediente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Especialidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Última Actuación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {client.cases.map((c: any) => (
                        <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-primary">{c.internalNumber}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={c.description}>{c.description || 'Sin descripción'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-foreground">{c.specialty?.name || 'General'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {c.actions && c.actions.length > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-sm text-foreground">{c.actions[0].type}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(c.actions[0].date).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Ninguna</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {c.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-900" onClick={() => navigate(`/cases/${c.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
