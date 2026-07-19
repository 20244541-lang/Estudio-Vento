import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import { clientService } from '../../services/clientService';
import { userService } from '../../services/subCaseServices';

interface CaseFormProps {
  onClose: (shouldRefetch: boolean) => void;
}

export default function CaseForm({ onClose }: CaseFormProps) {
  const [formData, setFormData] = useState({
    internalNumber: `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    docketNumber: '',
    clientId: '',
    specialtyId: 'a3353a7e-1a2e-4e6a-847c-917393ab375f', // Valid ID from DB (General)
    entityId: 'cd829a26-08be-4b4a-ae1f-0e3a49cc5af6', // Valid ID from DB (Poder Judicial)
    responsibleId: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    observations: '',
  });

  const [error, setError] = useState('');

  // Cargar lista de clientes para el select
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll,
  });

  // Cargar lista de usuarios (abogados) para el responsable
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
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
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">Selecciona un cliente de tu directorio...</option>
                {clients?.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.documentId}
                  </option>
                ))}
              </select>
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
