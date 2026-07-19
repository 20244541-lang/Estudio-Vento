import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import { userService } from '../../services/subCaseServices';

interface CaseEditFormProps {
  caseData: any;
  onClose: (shouldRefetch: boolean) => void;
}

export default function CaseEditForm({ caseData, onClose }: CaseEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    docketNumber: caseData.docketNumber || '',
    status: caseData.status || 'OPEN',
    priority: caseData.priority || 'MEDIUM',
    startDate: caseData.startDate ? new Date(caseData.startDate).toISOString().split('T')[0] : '',
    closeDate: caseData.closeDate ? new Date(caseData.closeDate).toISOString().split('T')[0] : '',
    description: caseData.description || '',
    observations: caseData.observations || '',
    responsibleId: caseData.responsibleId || '',
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: any) => caseService.update(caseData.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      onClose(true);
    },
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    updateMutation.mutate({
      ...formData,
      closeDate: formData.status === 'CLOSED' && !formData.closeDate 
        ? new Date().toISOString() 
        : formData.closeDate || undefined
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Editar Expediente ({caseData.internalNumber})
          </h2>
          <button onClick={() => onClose(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">N° Exp. Judicial</label>
              <input
                type="text"
                name="docketNumber"
                value={formData.docketNumber}
                onChange={handleChange}
                placeholder="Ej. 00123-2026..."
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="OPEN">Abierto</option>
                <option value="CLOSED">Cerrado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Abogado Responsable *</label>
              {usersLoading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <select
                  name="responsibleId"
                  value={formData.responsibleId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <option value="">Selecciona...</option>
                  {users?.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Ingreso</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prioridad</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
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
            <label className="block text-sm font-medium text-foreground mb-1">Descripción del caso</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observaciones Estratégicas</label>
            <textarea
              name="observations"
              rows={3}
              value={formData.observations}
              onChange={handleChange}
              placeholder="Notas internas que solo verá el estudio..."
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          {formData.status === 'CLOSED' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Cierre</label>
              <input
                type="date"
                name="closeDate"
                value={formData.closeDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
