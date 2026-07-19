import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import { clientService } from '../../services/clientService';
import { userService } from '../../services/subCaseServices';
import { catalogService } from '../../services/catalogService';

interface CaseFormProps {
  onClose: (shouldRefetch: boolean) => void;
}

export default function CaseForm({ onClose }: CaseFormProps) {
  const [formData, setFormData] = useState({
    internalNumber: `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    docketNumber: '',
    clientId: '',
    specialtyId: '',
    entityId: '',
    responsibleId: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    observations: '',
  });

  const [error, setError] = useState('');
  
  // Estados para el buscador de clientes
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar catálogos
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const { data: specialties, isLoading: specialtiesLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: catalogService.getSpecialties,
  });

  const { data: entities, isLoading: entitiesLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: catalogService.getEntities,
  });

  const createMutation = useMutation({
    mutationFn: caseService.create,
    onSuccess: () => onClose(true),
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.clientId) {
      setError('Debes seleccionar un cliente para este expediente.');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Filtrar clientes en base a la búsqueda
  const filteredClients = clients?.filter((c: any) => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    (c.documentId && c.documentId.includes(clientSearch))
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Nuevo Expediente (Caso)
          </h2>
          <button onClick={() => onClose(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cliente / Contacto *</label>
            {clientsLoading ? (
              <div className="text-sm text-muted-foreground">Cargando clientes...</div>
            ) : (
              <div className="relative" ref={clientDropdownRef}>
                {formData.clientId ? (
                  <div className="w-full px-3 py-2 border border-input rounded-md bg-muted/50 flex justify-between items-center">
                    <span className="text-sm text-foreground font-medium">
                      {clients?.find((c: any) => c.id === formData.clientId)?.name} - {clients?.find((c: any) => c.id === formData.clientId)?.documentId}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setFormData({...formData, clientId: ''}); setClientSearch(''); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Quitar cliente"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre o DNI..."
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                      />
                    </div>
                    {showClientDropdown && (
                      <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client: any) => (
                            <li 
                              key={client.id}
                              onClick={() => {
                                setFormData({ ...formData, clientId: client.id });
                                setShowClientDropdown(false);
                                setClientSearch('');
                              }}
                              className="px-4 py-2 text-sm hover:bg-muted cursor-pointer flex justify-between items-center text-foreground"
                            >
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.documentId}</span>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                            No se encontraron clientes
                          </li>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              El expediente se vinculará directamente a este cliente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Número Interno *</label>
              <input
                type="text"
                name="internalNumber"
                required
                value={formData.internalNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">N° Exp. Judicial</label>
              <input
                type="text"
                name="docketNumber"
                value={formData.docketNumber}
                onChange={handleChange}
                placeholder="Ej. 00123-2026-0-1801..."
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Especialidad *</label>
              {specialtiesLoading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <select
                  name="specialtyId"
                  value={formData.specialtyId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="">Selecciona especialidad...</option>
                  {specialties?.map((spec: any) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Entidad / Juzgado *</label>
              {entitiesLoading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <select
                  name="entityId"
                  value={formData.entityId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="">Selecciona entidad...</option>
                  {entities?.map((ent: any) => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Abogado Responsable *</label>
            {usersLoading ? (
              <div className="text-sm text-muted-foreground">Cargando abogados...</div>
            ) : (
              <select
                name="responsibleId"
                value={formData.responsibleId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">Selecciona un abogado responsable...</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Ingreso *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prioridad *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción breve del caso *</label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalla de qué trata este problema legal..."
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observaciones / Notas (Opcional)</label>
            <textarea
              name="observations"
              rows={2}
              value={formData.observations}
              onChange={handleChange}
              placeholder="Notas internas, estrategia sugerida, etc."
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !formData.clientId}>
              {createMutation.isPending ? 'Guardando...' : 'Guardar Expediente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
