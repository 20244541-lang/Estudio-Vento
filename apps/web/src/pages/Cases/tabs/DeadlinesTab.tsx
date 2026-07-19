import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { deadlineService } from '../../../services/subCaseServices';

export default function DeadlinesTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ daysCount: '', daysType: 'HABILE', dueDate: '' });

  const { data: deadlines, isLoading, refetch } = useQuery({
    queryKey: ['case-deadlines', caseId],
    queryFn: () => deadlineService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => deadlineService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setFormData({ daysCount: '', daysType: 'HABILE', dueDate: '' });
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deadlineService.delete,
    onSuccess: () => refetch()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">Control de Plazos</h3>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Cancelar' : 'Nuevo Plazo'}
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad de Días</label>
              <input 
                type="number" 
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.daysCount}
                onChange={e => setFormData({...formData, daysCount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Días</label>
              <select 
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.daysType}
                onChange={e => setFormData({...formData, daysType: e.target.value})}
              >
                <option value="HABILE">Hábiles</option>
                <option value="CALENDARIO">Calendario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Vencimiento Exacta</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={createMutation.isPending}>Guardar Plazo</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando plazos...</div>
      ) : deadlines?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          No hay plazos registrados en este expediente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deadlines?.map((deadline: any) => {
            const overdue = isOverdue(deadline.dueDate);
            return (
              <div key={deadline.id} className={`p-4 rounded-lg border shadow-sm relative ${overdue ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-card border-border'}`}>
                <button 
                  onClick={() => deleteMutation.mutate(deadline.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center mb-2">
                  <CalendarIcon className={`h-5 w-5 mr-2 ${overdue ? 'text-red-500' : 'text-primary'}`} />
                  <span className={`font-bold ${overdue ? 'text-red-700 dark:text-red-300' : 'text-foreground'}`}>
                    Vence: {new Date(deadline.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Plazo original: {deadline.daysCount} días {deadline.daysType === 'HABILE' ? 'hábiles' : 'calendario'}
                </div>
                {overdue && (
                  <div className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    ¡Plazo Vencido!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
