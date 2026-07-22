import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Calendar as CalendarIcon, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { deadlineService } from '../../../services/subCaseServices';

function getDaysRemaining(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DeadlinesTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    concept: '',
    daysCount: '',
    daysType: 'HABILE',
    dueDate: '',
  });

  const { data: deadlines, isLoading, refetch } = useQuery({
    queryKey: ['case-deadlines', caseId],
    queryFn: () => deadlineService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => deadlineService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setFormData({ concept: '', daysCount: '', daysType: 'HABILE', dueDate: '' });
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

  const getUrgencyStyle = (daysLeft: number) => {
    if (daysLeft < 0) return {
      card: 'bg-red-50 dark:bg-red-950/20 border-red-300',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      label: `Vencido hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}`,
    };
    if (daysLeft <= 3) return {
      card: 'bg-orange-50 dark:bg-orange-950/20 border-orange-300',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      label: daysLeft === 0 ? '¡Vence hoy!' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''} — URGENTE`,
    };
    if (daysLeft <= 7) return {
      card: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      icon: <Clock className="h-3 w-3 mr-1" />,
      label: `${daysLeft} días restantes`,
    };
    return {
      card: 'bg-card border-border',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      label: `${daysLeft} días restantes`,
    };
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
          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Concepto del Plazo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Plazo para contestar Resolución N° 12, Plazo de contestación de escrito..."
              className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              value={formData.concept}
              onChange={e => setFormData({ ...formData, concept: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe el motivo por el que se está registrando este plazo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Días del Plazo</label>
              <input
                type="number"
                required
                min="1"
                placeholder="15"
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.daysCount}
                onChange={e => setFormData({ ...formData, daysCount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Días</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.daysType}
                onChange={e => setFormData({ ...formData, daysType: e.target.value })}
              >
                <option value="HABILE">Hábiles</option>
                <option value="CALENDARIO">Calendario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Vencimiento</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Guardar Plazo'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando plazos...</div>
      ) : !deadlines || deadlines.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No hay plazos registrados en este expediente.</p>
          <p className="text-xs mt-1">Usa el botón "Nuevo Plazo" para agregar plazos de resoluciones, escritos, etc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deadlines?.map((deadline: any) => {
            const daysLeft = getDaysRemaining(deadline.dueDate);
            const { card, badge, icon, label } = getUrgencyStyle(daysLeft);

            return (
              <div key={deadline.id} className={`p-4 rounded-lg border shadow-sm relative ${card}`}>
                <button
                  onClick={() => deleteMutation.mutate(deadline.id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar plazo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Concepto */}
                <p className="font-semibold text-foreground text-sm pr-6 mb-2 leading-snug">
                  {deadline.concept || 'Plazo sin concepto'}
                </p>

                {/* Badge de urgencia */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${badge}`}>
                  {icon}{label}
                </span>

                {/* Fecha y detalle */}
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  Vence el{' '}
                  <span className="font-medium text-foreground ml-1">
                    {new Date(deadline.dueDate).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Plazo: {deadline.daysCount} días {deadline.daysType === 'HABILE' ? 'hábiles' : 'calendario'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
